import type { TreeItemResponse } from '@/services/api'

export const MAX_LEARNING_TREE_STEPS = 9

export type LearningTreeItemType = 'homework' | 'activity' | 'quiz'

type OrderedTreeItem = TreeItemResponse & {
  normalizedType: LearningTreeItemType
  originalIndex: number
}

export type LearningTreeStep = OrderedTreeItem & {
  stepNumber: number
  dayNumber: number
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
}

export function isLearningTreeContentCompletedStatus(status: string | null | undefined) {
  const normalized = status?.trim().toLowerCase()
  return normalized === 'completed' || normalized === 'submitted' || normalized === 'graded'
}

export function normalizeLearningTreeItemType(itemType: string | null | undefined): LearningTreeItemType | null {
  const normalized = itemType?.trim().toLowerCase()

  if (!normalized) {
    return null
  }

  if (normalized.includes('homework')) {
    return 'homework'
  }

  if (normalized.includes('activity') || normalized.includes('task')) {
    return 'activity'
  }

  if (normalized.includes('quiz')) {
    return 'quiz'
  }

  return null
}

function compareNullableNumbers(a: number | null | undefined, b: number | null | undefined) {
  const left = typeof a === 'number' ? a : Number.MAX_SAFE_INTEGER
  const right = typeof b === 'number' ? b : Number.MAX_SAFE_INTEGER
  return left - right
}

function typeOrder(type: LearningTreeItemType) {
  switch (type) {
    case 'homework':
      return 0
    case 'activity':
      return 1
    case 'quiz':
      return 2
  }
}

function buildFallbackSequence(items: OrderedTreeItem[]) {
  const withinTypeSorter = (left: OrderedTreeItem, right: OrderedTreeItem) => (
    compareNullableNumbers(left.groupNumber, right.groupNumber)
    || compareNullableNumbers(left.orderNum, right.orderNum)
    || left.originalIndex - right.originalIndex
  )

  const homeworks = items.filter((item) => item.normalizedType === 'homework').sort(withinTypeSorter)
  const activities = items.filter((item) => item.normalizedType === 'activity').sort(withinTypeSorter)
  const quizzes = items.filter((item) => item.normalizedType === 'quiz').sort(withinTypeSorter)
  const maxBucketSize = Math.max(homeworks.length, activities.length, quizzes.length)
  const ordered: OrderedTreeItem[] = []

  for (let index = 0; index < maxBucketSize; index += 1) {
    if (homeworks[index]) {
      ordered.push(homeworks[index])
    }
    if (activities[index]) {
      ordered.push(activities[index])
    }
    if (quizzes[index]) {
      ordered.push(quizzes[index])
    }
  }

  return ordered
}

export function orderLearningTreeItems(items: TreeItemResponse[]) {
  const normalizedItems = items
    .map((item, originalIndex) => {
      const normalizedType = normalizeLearningTreeItemType(item.itemType)

      if (!normalizedType) {
        return null
      }

      return {
        ...item,
        normalizedType,
        originalIndex,
      }
    })
    .filter((item): item is OrderedTreeItem => item !== null)

  if (normalizedItems.length === 0) {
    return []
  }

  const hasGroupNumbers = normalizedItems.every(
    (item) => typeof item.groupNumber === 'number' && item.groupNumber > 0
  )

  if (hasGroupNumbers) {
    return normalizedItems.sort((left, right) => (
      compareNullableNumbers(left.groupNumber, right.groupNumber)
      || typeOrder(left.normalizedType) - typeOrder(right.normalizedType)
      || compareNullableNumbers(left.orderNum, right.orderNum)
      || left.originalIndex - right.originalIndex
    ))
  }

  const hasExplicitOrder = normalizedItems.every(
    (item) => typeof item.orderNum === 'number' && item.orderNum > 0
  )

  if (hasExplicitOrder) {
    return normalizedItems.sort((left, right) => (
      compareNullableNumbers(left.orderNum, right.orderNum)
      || compareNullableNumbers(left.groupNumber, right.groupNumber)
      || typeOrder(left.normalizedType) - typeOrder(right.normalizedType)
      || left.originalIndex - right.originalIndex
    ))
  }

  return buildFallbackSequence(normalizedItems)
}

export function buildLearningTreeSteps(
  items: TreeItemResponse[],
  maxSteps = MAX_LEARNING_TREE_STEPS
) {
  const orderedItems = orderLearningTreeItems(items).slice(0, maxSteps)
  const completedFlags = orderedItems.map(
    (item) => Boolean(item.completed) || isLearningTreeContentCompletedStatus(item.status)
  )
  const currentIndex = completedFlags.findIndex((isCompleted) => !isCompleted)
  const hasBackendLockState = orderedItems.some((item) => typeof item.locked === 'boolean')

  return orderedItems.map<LearningTreeStep>((item, index) => {
    const isCompleted = completedFlags[index]
    const isCurrent = currentIndex >= 0 && index === currentIndex
    const isLockedBySequence = !isCompleted && currentIndex >= 0 && index > currentIndex
    const isLockedByBackend = hasBackendLockState && item.locked === true && !isCurrent
    const isLocked = isLockedBySequence || isLockedByBackend

    return {
      ...item,
      stepNumber: index + 1,
      dayNumber: item.groupNumber ?? Math.ceil((index + 1) / 3),
      isCompleted,
      isCurrent,
      isLocked,
    }
  })
}

export function buildLearningTreeAccessMap(items: TreeItemResponse[]) {
  const map = new Map<string, LearningTreeStep>()

  for (const step of buildLearningTreeSteps(items)) {
    map.set(step.id, step)
  }

  return map
}

export function getLearningTreeStepStatus(step: LearningTreeStep | null | undefined) {
  if (!step) {
    return {
      isCompleted: false,
      isCurrent: false,
      isLocked: false,
    }
  }

  return {
    isCompleted: step.isCompleted,
    isCurrent: step.isCurrent,
    isLocked: step.isLocked,
  }
}
