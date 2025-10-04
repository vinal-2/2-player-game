"use client"

import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ImageSourcePropType } from "react-native"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAd } from "../contexts/AdContext"
import { useAnalytics } from "../contexts/AnalyticsContext"

type AdModalProps = { visible: boolean }

type AdContent = {
  title: string
  description: string
  image: ImageSourcePropType
}

const AdModal: React.FC<AdModalProps> = ({ visible }) => {
  const { closeAdModal } = useAd()
  const { trackEvent } = useAnalytics()
  const [timeLeft, setTimeLeft] = useState(30)
  const [adContent, setAdContent] = useState<AdContent>({
    title: "Premium Games Collection",
    description: "Upgrade to premium for an ad-free experience and exclusive games!",
    image: require("../assets/images/ad-image.png"),
  })

  useEffect(() => {
    if (visible) {
      trackEvent("ad_shown", { ad_type: "interstitial" })
      setTimeLeft(30)

      // Simulate different ads
      const adOptions: AdContent[] = [
        {
          title: "Premium Games Collection",
          description: "Upgrade to premium for an ad-free experience and exclusive games!",
          image: require("../assets/images/ad-image.png"),
        },
        {
          title: "Fun Learning Games",
          description: "Discover educational games that make learning fun!",
          image: require("../assets/images/ad-image-2.png"),
        },
        {
          title: "New Games Added Weekly",
          description: "Stay tuned for exciting new games every week!",
          image: require("../assets/images/ad-image-3.png"),
        },
      ]

      setAdContent(adOptions[Math.floor(Math.random() * adOptions.length)])

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [trackEvent, visible])

  const handleAdClick = () => {
    trackEvent("ad_click", { ad_title: adContent.title })
  }

  if (!visible) return null

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        if (timeLeft === 0) closeAdModal()
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.adHeader}>
            <Text style={styles.adLabel}>Advertisement</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleAdClick}>
            <Image source={adContent.image} style={styles.adImage} resizeMode="cover" />
          </TouchableOpacity>

          <View style={styles.adInfo}>
            <Text style={styles.adTitle}>{adContent.title}</Text>
            <Text style={styles.adDescription}>{adContent.description}</Text>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, timeLeft > 0 ? styles.closeButtonDisabled : styles.closeButtonEnabled]}
            onPress={closeAdModal}
            disabled={timeLeft > 0}
          >
            <Ionicons name="close" size={24} color={timeLeft > 0 ? "#FFFFFF80" : "white"} />
            <Text style={[styles.closeButtonText, timeLeft > 0 && { opacity: 0.5 }]}>
              {timeLeft > 0 ? `Wait ${timeLeft}s` : "Close Ad"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#16213E",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
  },
  adHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1A1A2E",
  },
  adLabel: {
    color: "#FFFFFF80",
    fontSize: 14,
    fontWeight: "500",
  },
  timerContainer: {
    backgroundColor: "#FFFFFF20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  adImage: {
    width: "100%",
    height: 200,
  },
  adInfo: {
    padding: 16,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF20",
  },
  closeButtonEnabled: {
    backgroundColor: "#4CAF50",
  },
  closeButtonDisabled: {
    backgroundColor: "#FFFFFF10",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default AdModal

