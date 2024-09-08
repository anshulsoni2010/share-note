import React, { useEffect } from 'react'
import useStore from './lib/ZustStore'
import TopLogo from './components/Common/TopLogo'
import EditorBase from './components/EditorPage/EditorBase'
import CopySideBar from './components/SideBar/CopySideBar/CopySideBar'
import AuthModal from './components/Auth/AuthModal'

const App = () => {
 const { deleteDocument, checkAuth, user } = useStore();

 useEffect(() => {
  deleteDocument();
  checkAuth(); // Check authentication status on app load
 }, [])

  return (
    <>
      <TopLogo/>
      <EditorBase/>
      <CopySideBar/>
      <AuthModal />
    </>
  )
}

export default App
