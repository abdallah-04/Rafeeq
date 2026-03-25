import { View } from 'react-native'

interface SpacerProps {
  width?: number | string
  height?: number
}

export default function Spacer({
  width = "100%",
  height = 40,
}: SpacerProps) {
  return <View style={{ width, height }} />
}