
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QuestionsProvider } from './contexts/QuestionsContext.tsx'
import { BackendConfigProvider } from './contexts/BackendConfigContext'

createRoot(document.getElementById("root")!).render(
  <BackendConfigProvider>
    <QuestionsProvider>
      <App />
    </QuestionsProvider>
  </BackendConfigProvider>
);
