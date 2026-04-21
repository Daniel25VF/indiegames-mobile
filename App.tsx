import 'react-native-get-random-values'
import { AppProvider } from './src/context/AppContext'
import Navigation from './src/navigation'

export default function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  )
}
