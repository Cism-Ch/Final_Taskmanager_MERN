import { Outlet } from 'react-router-dom'
import taskMan from '../assets/images/taskMan.png'
import bgLayout01 from '../assets/images/bg-layout01.jpg'

function Layout() {
  return (
    <>
      <div className="flex h-screen w-screen">
      <div className="hidden flex-1 items-center justify-center bg-cover lg:flex relative overflow-hidden" style={{ backgroundImage: `url(${bgLayout01})` }}>

        <div className="max-w-md space-y-4 p-12 text-center text-black backdrop-blur-sm bg-gradient-to-br from-orange-50/10 to-purple-100/40 rounded-2xl">
          
          <img src={taskMan} alt="dashboard widget" />
          <h1 className="text-5xl font-bold">Welcome!</h1>
          <h2 className="text-3xl font-bold text-amber-400">Tosky</h2>
          <p className="text-lg font-light text-white">
            Planning your tasks has never been easier!<br />
          </p>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bgLayout01})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-lg"></div>

        <div className="max-w-md overflow-y-auto px-2 sm:w-[500px] z-10 relative">
          <Outlet />
        </div>
      </div>
      </div>
      <div id="modal-root"></div>
    </>
  )
}

export default Layout

