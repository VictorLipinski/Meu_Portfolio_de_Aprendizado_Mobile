/** Opções de horário para agendamento de lembretes — compartilhadas entre telas */

function secondsUntilHour(hour: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return Math.max(60, Math.floor((target.getTime() - now.getTime()) / 1000))
}

function secondsUntilTomorrow(hour: number): number {
  const target = new Date()
  target.setDate(target.getDate() + 1)
  target.setHours(hour, 0, 0, 0)
  return Math.floor((target.getTime() - Date.now()) / 1000)
}

export const REMINDER_OPTIONS = [
  { label: 'Em 30 minutos',     seconds: 30 * 60 },
  { label: 'Em 1 hora',         seconds: 60 * 60 },
  { label: 'Em 3 horas',        seconds: 3 * 60 * 60 },
  { label: 'Esta noite às 20h', seconds: secondsUntilHour(20) },
  { label: 'Amanhã às 9h',      seconds: secondsUntilTomorrow(9) },
] as const
