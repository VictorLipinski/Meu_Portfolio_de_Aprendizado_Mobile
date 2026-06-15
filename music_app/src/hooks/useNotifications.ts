import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { AlbumReminder } from '@/types'

const REMINDERS_KEY = '@noomi:reminders'

// ─── Configuração global de exibição de notificação em foreground ─────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function useNotifications() {
  const [reminders, setReminders] = useState<AlbumReminder[]>([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    setupAndLoad()
  }, [])

  async function setupAndLoad() {
    await requestPermissions()
    await loadAndSyncReminders()
  }

  async function requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('noomi-reminders', {
          name: 'Lembretes de Álbuns',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#88a5dc',
        })
      }
      const { status: existing } = await Notifications.getPermissionsAsync()
      if (existing === 'granted') {
        setPermissionGranted(true)
        return true
      }
      const { status } = await Notifications.requestPermissionsAsync()
      const granted = status === 'granted'
      setPermissionGranted(granted)
      return granted
    } catch {
      return false
    }
  }

  // Carrega lembretes salvos e sincroniza com as notificações realmente agendadas
  const loadAndSyncReminders = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(REMINDERS_KEY)
      if (!raw) { setReminders([]); return }

      const stored: AlbumReminder[] = JSON.parse(raw)
      const scheduled = await Notifications.getAllScheduledNotificationsAsync()
      const scheduledIds = new Set(scheduled.map((n) => n.identifier))

      // Remove lembretes cujas notificações já foram disparadas ou canceladas
      const active = stored.filter((r) => scheduledIds.has(r.notificationId))
      setReminders(active)

      if (active.length !== stored.length) {
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(active))
      }
    } catch {
      // silently ignore
    }
  }, [])

  /**
   * Agenda um lembrete para um álbum.
   * @param secondsFromNow Segundos a partir de agora para disparar a notificação.
   * @returns true se agendado com sucesso, false caso contrário.
   */
  async function scheduleReminder(
    albumId: string,
    albumName: string,
    artistName: string,
    secondsFromNow: number
  ): Promise<boolean> {
    const granted = permissionGranted || (await requestPermissions())
    if (!granted) return false

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎵 Hora de ouvir!',
          body: `${albumName} · ${artistName} está esperando por você.`,
          data: { albumId, albumName },
          sound: true,
        },
        trigger: {
          seconds: secondsFromNow,
          channelId: 'noomi-reminders',
        } as Notifications.TimeIntervalTriggerInput,
      })

      const reminder: AlbumReminder = {
        id: `rem_${albumId}_${Date.now()}`,
        notificationId,
        albumId,
        albumName,
        artistName,
        scheduledFor: new Date(Date.now() + secondsFromNow * 1000).toISOString(),
      }

      const updated = [reminder, ...reminders.filter((r) => r.albumId !== albumId)]
      setReminders(updated)
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated))
      return true
    } catch {
      return false
    }
  }

  /** Cancela todos os lembretes ativos para um determinado álbum */
  async function cancelReminder(albumId: string): Promise<void> {
    try {
      const toCancel = reminders.filter((r) => r.albumId === albumId)
      await Promise.all(
        toCancel.map((r) => Notifications.cancelScheduledNotificationAsync(r.notificationId))
      )
      const updated = reminders.filter((r) => r.albumId !== albumId)
      setReminders(updated)
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated))
    } catch {
      // silently ignore
    }
  }

  /** Verifica se há lembrete ativo para um álbum */
  function hasReminder(albumId: string): boolean {
    return reminders.some((r) => r.albumId === albumId)
  }

  /** Retorna o lembrete de um álbum específico */
  function getReminderFor(albumId: string): AlbumReminder | undefined {
    return reminders.find((r) => r.albumId === albumId)
  }

  return {
    reminders,
    permissionGranted,
    scheduleReminder,
    cancelReminder,
    hasReminder,
    getReminderFor,
    reload: loadAndSyncReminders,
  }
}
