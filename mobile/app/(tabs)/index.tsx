import { Redirect } from 'expo-router'

// Rota inicial: encaminha para o login. O AuthProvider decide, a partir do
// token salvo, se o usuário segue para /produtos ou permanece no login.
export default function Index() {
  return <Redirect href="/login" />
}
