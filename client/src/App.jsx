import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Mainlayout from './layout/Mainlayout'



function App() {
  const [count, setCount] = useState(0)

  return (
    
    <>
      <Mainlayout />
    </>
    
  )
}

export default App
