import { NavLink, Outlet } from 'react-router-dom'

// Shared page frame: navigation bar on top, the current page below (<Outlet />).
export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand">販売管理</span>
          <nav className="nav">
            <NavLink to="/" end>
              ダッシュボード
            </NavLink>
            <NavLink to="/products">商品</NavLink>
            <NavLink to="/sales">売上</NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
