import React, { useRef, useEffect } from 'react'
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
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/theme'
import BottomNav from '@/components/modal/shared/BottomNav'
import { useModal } from '@/components/modal/ModalProvider'

const { colors, spacing, typography, radius } = theme
const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Types ────────────────────────────────────────────────────────────────────
type DayStatus = 'completed' | 'current' | 'locked'

interface DayNode {
    day: number
    status: DayStatus
    /** horizontal offset: 'left' | 'center' | 'right' */
    align: 'left' | 'center' | 'right'
    /** show mascot below this node */
    mascot?: 'reading' | 'waving'
    /** modal variant to open */
    modalVariant?: 'whatTodayOkay' | 'day5work' | 'day6work' | 'day7work'
}

// DAY 7 at top → DAY 1 at bottom (rendered top-to-bottom in ScrollView)
const DAYS: DayNode[] = [
    { day: 7, status: 'current',   align: 'center', modalVariant: 'day7work'      },
    { day: 6, status: 'locked',    align: 'right',  modalVariant: 'day6work'      },
    { day: 5, status: 'locked',    align: 'left',   mascot: 'reading', modalVariant: 'day5work' },
    { day: 4, status: 'locked',    align: 'center', modalVariant: 'whatTodayOkay' },
    { day: 3, status: 'completed', align: 'left'                                   },
    { day: 2, status: 'completed', align: 'right',  mascot: 'waving'               },
    { day: 1, status: 'completed', align: 'left'                                   },
    ]

    // ─── Constants ────────────────────────────────────────────────────────────────
    const NODE_SIZE = 52
    const MASCOT_SIZE = 90
    const ROW_HEIGHT = 110  // vertical spacing between nodes
    const PATH_WIDTH = 6

    const ALIGN_X: Record<DayNode['align'], number> = {
    left:   SCREEN_WIDTH * 0.22,
    center: SCREEN_WIDTH * 0.5,
    right:  SCREEN_WIDTH * 0.72,
    }

    // ─── Helper: path segment SVG-like curve as View-based dashed curve
    // We approximate the winding path with simple straight segments between nodes
    function PathSegment({ fromX, fromY, toX, toY }: { fromX: number; fromY: number; toX: number; toY: number }) {
    const dx = toX - fromX
    const dy = toY - fromY
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    return (
        <View
        pointerEvents="none"
        style={{
            position: 'absolute',
            left: fromX,
            top: fromY,
            width: length,
            height: PATH_WIDTH,
            backgroundColor: '#A8C8F0',
            borderRadius: PATH_WIDTH / 2,
            transformOrigin: '0 50%',
            transform: [{ rotate: `${angle}deg` }],
            opacity: 0.7,
        }}
        />
    )
    }

    // ─── Day Node ─────────────────────────────────────────────────────────────────
    function DayNodeView({
    node,
    x,
    y,
    onPress,
    animValue,
    }: {
    node: DayNode
    x: number
    y: number
    onPress: () => void
    animValue: Animated.Value
    }) {
    const isCompleted = node.status === 'completed'
    const isCurrent   = node.status === 'current'
    const isLocked    = node.status === 'locked'

    const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    })

    return (
        <Animated.View
        style={{
            position: 'absolute',
            left: x - NODE_SIZE / 2,
            top: y - NODE_SIZE / 2,
            transform: [{ scale }],
        }}
        >
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={isCurrent ? 0.7 : 0.8}
            style={[
            styles.node,
            isCompleted && styles.nodeCompleted,
            isCurrent   && styles.nodeCurrent,
            isLocked    && styles.nodeLocked,
            ]}
        >
            {isCompleted && (
            <Text style={styles.checkIcon}>✓</Text>
            )}
            {isCurrent && (
            <Image
                source={require('@/assets/images/icons/crown.png')}
                style={styles.crownIcon}
                resizeMode="contain"
            />
            )}
            {isLocked && (
            <View style={styles.lockedDot} />
            )}
        </TouchableOpacity>

        {/* Day label */}
        <View style={[styles.dayLabel, { left: isCurrent ? -10 : (x < SCREEN_WIDTH / 2 ? NODE_SIZE + 6 : -(56 + 6)) }]}>
            <Text style={[styles.dayText, isCurrent && styles.dayTextCurrent]}>
            DAY {node.day}
            </Text>
        </View>
        </Animated.View>
    )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TreeScreen() {
  const { show } = useModal()

  // Staggered entrance animations
  const anims = useRef(DAYS.map(() => new Animated.Value(0))).current

  useEffect(() => {
    const animations = DAYS.map((_, i) =>
      Animated.timing(anims[i], {
        toValue: 1,
        duration: 400,
        delay: i * 80,
        useNativeDriver: true,
      })
    )
    Animated.stagger(80, animations).start()
  }, [])

  const handleNodePress = (node: DayNode) => {
    if (node.status === 'completed') return
    if (node.modalVariant) {
      show('daywork', { variant: node.modalVariant })
    }
  }

  // Calculate canvas height
  const canvasHeight = DAYS.length * ROW_HEIGHT + ROW_HEIGHT

  // Node positions (top → bottom = day 7 → day 1)
  const positions = DAYS.map((node, i) => ({
    x: ALIGN_X[node.align],
    y: ROW_HEIGHT / 2 + i * ROW_HEIGHT,
  }))

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayoub's tree</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable canvas */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.canvas, { height: canvasHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Path segments between nodes */}
        {positions.map((pos, i) => {
          if (i === positions.length - 1) return null
          const next = positions[i + 1]
          return (
            <PathSegment
              key={`path-${i}`}
              fromX={pos.x}
              fromY={pos.y}
              toX={next.x}
              toY={next.y}
            />
          )
        })}

        {/* Day nodes */}
        {DAYS.map((node, i) => {
          const { x, y } = positions[i]
          const hasMascot = !!node.mascot

          return (
            <React.Fragment key={node.day}>
              <DayNodeView
                node={node}
                x={x}
                y={y}
                onPress={() => handleNodePress(node)}
                animValue={anims[i]}
              />

              {/* Mascot image near this node */}
              {hasMascot && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: node.align === 'left'
                      ? x + NODE_SIZE / 2 + 4
                      : x - NODE_SIZE / 2 - MASCOT_SIZE - 4,
                    top: y - MASCOT_SIZE / 2 + 10,
                    opacity: anims[i],
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

      <BottomNav />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
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

  // Node styles
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nodeCompleted: {
    backgroundColor: '#5BA4E6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3A7BC8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  nodeCurrent: {
    backgroundColor: '#2B6FD4',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#1A4FA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: (NODE_SIZE + 8) / 2,
  },

  nodeLocked: {
    backgroundColor: '#7AAEDE',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#5588BB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  checkIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
  },

  crownIcon: {
    width: 26,
    height: 26,
    tintColor: '#FFFFFF',
  },

  lockedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  dayLabel: {
    position: 'absolute',
    top: NODE_SIZE / 2 - 10,
    width: 60,
  },

  dayText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#2B5C99',
  },

  dayTextCurrent: {
    fontSize: typography.fontSize.base,
    color: '#1A3F6F',
  },
})