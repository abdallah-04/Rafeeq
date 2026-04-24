import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import BackButton from '@/components/modal/shared/BackButton'
import { useModal } from '@/components/modal/ModalProvider'

const { colors, spacing, typography } = theme
const { width: SCREEN_WIDTH } = Dimensions.get('window')

type DayStatus = 'completed' | 'current' | 'locked'

interface DayNode {
  day: number
  status: DayStatus
  align: 'left' | 'center' | 'right'
  mascot?: 'reading' | 'waving'
  modalVariant?: 'whatTodayOkay' | 'day5work' | 'day6work' | 'day7work'
}

const DAYS: DayNode[] = [
  { day: 7, status: 'current', align: 'center', modalVariant: 'day7work' },
  { day: 6, status: 'locked', align: 'right', modalVariant: 'day6work' },
  { day: 5, status: 'locked', align: 'left', mascot: 'reading', modalVariant: 'day5work' },
  { day: 4, status: 'locked', align: 'center', modalVariant: 'whatTodayOkay' },
  { day: 3, status: 'completed', align: 'left' },
  { day: 2, status: 'completed', align: 'right', mascot: 'waving' },
  { day: 1, status: 'completed', align: 'left' },
]

const NODE_SIZE = 56
const CURRENT_SIZE = 68
const MASCOT_SIZE = 88
const ROW_HEIGHT = 120
const PADDING_TOP = 20

const ALIGN_X: Record<DayNode['align'], number> = {
  left: SCREEN_WIDTH * 0.2,
  center: SCREEN_WIDTH * 0.5,
  right: SCREEN_WIDTH * 0.8,
}

function CurvedPath({
  fromX,
  fromY,
  toX,
  toY,
  completed,
}: {
  fromX: number
  fromY: number
  toX: number
  toY: number
  completed: boolean
}) {
  const cx = (fromX + toX) / 2
  const cy = fromY + (toY - fromY) * 0.5
  const cpX = cx + (fromX < toX ? -40 : 40)
  const d = `M ${fromX} ${fromY} Q ${cpX} ${cy} ${toX} ${toY}`

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path
        d={d}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={d}
        stroke={completed ? '#5BA4E6' : '#A8C8F0'}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={completed ? undefined : '10 8'}
      />
    </Svg>
  )
}

function PulseRing({ anim }: { anim: Animated.Value }) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] })
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: CURRENT_SIZE + 16,
        height: CURRENT_SIZE + 16,
        borderRadius: (CURRENT_SIZE + 16) / 2,
        borderWidth: 3,
        borderColor: '#2B6FD4',
        top: -8,
        left: -8,
        transform: [{ scale }],
        opacity,
      }}
    />
  )
}

function DayNodeView({
  node,
  x,
  y,
  onPress,
  enterAnim,
}: {
  node: DayNode
  x: number
  y: number
  onPress: () => void
  enterAnim: Animated.Value
}) {
  const { t } = useTranslation()
  const pulseAnim = useRef(new Animated.Value(0)).current
  const isCompleted = node.status === 'completed'
  const isCurrent = node.status === 'current'
  const isLocked = node.status === 'locked'
  const size = isCurrent ? CURRENT_SIZE : NODE_SIZE

  useEffect(() => {
    if (!isCurrent) return
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start()
  }, [isCurrent, pulseAnim])

  const scale = enterAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.15, 1] })
  const labelLeft = x < SCREEN_WIDTH / 2 ? size + 8 : -(64 + 8)

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: enterAnim,
        transform: [{ scale }],
      }}
    >
      {isCurrent && <PulseRing anim={pulseAnim} />}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={isLocked ? 0.6 : 0.75}
        style={[
          styles.node,
          { width: size, height: size, borderRadius: size / 2 },
          isCompleted && styles.nodeCompleted,
          isCurrent && styles.nodeCurrent,
          isLocked && styles.nodeLocked,
        ]}
      >
        {isCompleted && <Text style={styles.checkIcon}>✓</Text>}
        {isCurrent && (
          <Image
            source={require('@/assets/images/icons/crown.png')}
            style={styles.crownIcon}
            resizeMode="contain"
          />
        )}
        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
      </TouchableOpacity>

      <View
        style={[
          styles.dayLabel,
          {
            left: isCurrent ? -(size / 2) : labelLeft,
            top: size / 2 - 11,
            width: isCurrent ? size * 2 : 64,
          },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            isCurrent && styles.dayTextCurrent,
            isCompleted && styles.dayTextCompleted,
            isLocked && styles.dayTextLocked,
            isCurrent && { textAlign: 'center' },
          ]}
        >
          {t('tree.day')} {node.day}
        </Text>
      </View>
    </Animated.View>
  )
}

export default function TreeScreen() {
  const { show } = useModal()
  const { t } = useTranslation()
  const anims = useRef(DAYS.map(() => new Animated.Value(0))).current

  useEffect(() => {
    Animated.stagger(
      100,
      DAYS.map((_, i) =>
        Animated.spring(anims[i], {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start()
  }, [anims])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/Home-parent' as any)
  }

  const handleNodePress = (node: DayNode) => {
    if (node.status === 'completed') return
    if (node.modalVariant) {
      show('daywork', { variant: node.modalVariant })
    }
  }

  const canvasHeight = DAYS.length * ROW_HEIGHT + ROW_HEIGHT
  const positions = DAYS.map((node, i) => ({
    x: ALIGN_X[node.align],
    y: PADDING_TOP + ROW_HEIGHT / 2 + i * ROW_HEIGHT,
  }))

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>{t('tree.title')}</Text>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.8}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.canvas, { height: canvasHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[StyleSheet.absoluteFill, { height: canvasHeight }]} pointerEvents="none">
          {positions.map((pos, i) => {
            if (i === positions.length - 1) return null
            const next = positions[i + 1]
            const completed = DAYS[i].status === 'completed' && DAYS[i + 1].status === 'completed'
            return (
              <CurvedPath
                key={`path-${i}`}
                fromX={pos.x}
                fromY={pos.y}
                toX={next.x}
                toY={next.y}
                completed={completed}
              />
            )
          })}
        </View>

        {DAYS.map((node, i) => {
          const { x, y } = positions[i]
          const nodeSize = node.status === 'current' ? CURRENT_SIZE : NODE_SIZE
          const mascotOnRight = x < SCREEN_WIDTH / 2
          const mascotX = mascotOnRight
            ? x + nodeSize / 2 + 8
            : x - nodeSize / 2 - MASCOT_SIZE - 8
          const mascotY = y - MASCOT_SIZE / 2

          return (
            <React.Fragment key={node.day}>
              <DayNodeView
                node={node}
                x={x}
                y={y}
                onPress={() => handleNodePress(node)}
                enterAnim={anims[i]}
              />

              {node.mascot && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: mascotX,
                    top: mascotY,
                    opacity: anims[i],
                    transform: [
                      {
                        scale: anims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <Image
                    source={
                      node.mascot === 'reading'
                        ? require('@/assets/images/mascot/rafeeq_reading.png')
                        : require('@/assets/images/mascot/rafeeq_waving.png')
                    }
                    style={{ width: MASCOT_SIZE, height: MASCOT_SIZE }}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </React.Fragment>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D6E8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#D6E8F8',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  canvas: {
    position: 'relative',
    width: SCREEN_WIDTH,
  },
  node: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCompleted: {
    backgroundColor: '#4A9FE0',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2A6FAF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeCurrent: {
    backgroundColor: '#1A5FCC',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#0A3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  nodeLocked: {
    backgroundColor: '#9DC4E8',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#6A9ABB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  checkIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
  },
  crownIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFD700',
  },
  lockIcon: {
    fontSize: 20,
  },
  dayLabel: {
    position: 'absolute',
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#3A6A9F',
  },
  dayTextCurrent: {
    fontSize: typography.fontSize.base,
    color: '#1A3F6F',
  },
  dayTextCompleted: {
    color: '#2A6FAF',
  },
  dayTextLocked: {
    color: '#7A9FBF',
  },
})
