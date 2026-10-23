import { NavLink, Outlet } from 'react-router-dom'

// Shared page frame: navigation bar on top, the current page below (<Outlet />).
export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand">Sales Manager</span>
          <nav className="nav">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/sales">Sales</NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
