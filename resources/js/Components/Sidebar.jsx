import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { FiGrid, FiUsers, FiX, FiChevronLeft } from "react-icons/fi";

export default function Sidebar({ showingSidebar, setShowingSidebar }) {
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebar_collapsed') === 'true'; }
        catch { return false; }
    });

    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        try { localStorage.setItem('sidebar_collapsed', String(collapsed)); }
        catch {}
    }, [collapsed]);

    const handleToggle = () => {
        const nextValue = !collapsed;
        setCollapsed(nextValue);
        try {
            localStorage.setItem('sidebar_collapsed', String(nextValue));
        } catch {}
        window.dispatchEvent(new Event('sidebar_toggle'));
    };

    const menuGroups = [
        {
            label: "Overview",
            items: [
                { id: "dashboard", name: "Dashboard", route: "dashboard", activePrefix: "dashboard", icon: FiGrid, badge: null },
            ],
        },
        {
            label: "Management",
            items: [
                { id: "users", name: "Users", route: "users.index", activePrefix: "users", icon: FiUsers, badge: null },
            ],
        },
    ];

    const NavItem = ({ item, showLabel, onClick }) => {
        const isActive =
            route().current(item.route) ||
            route().current(item.activePrefix + ".*");
        const Icon = item.icon;
        const isHovered = hoveredItem === item.id;

        return (
            <div 
                className="w-full"
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <Link
                    href={route(item.route)}
                    onClick={onClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: showLabel ? "12px" : "0",
                        padding: "10px 12px",
                        justifyContent: showLabel ? "flex-start" : "center",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "500",
                        marginBottom: "4px",
                        position: "relative",
                        transition: "all 0.2s ease",
                        background: isActive 
                            ? "rgba(99, 102, 241, 0.15)" 
                            : isHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        color: isActive 
                            ? "#a5b4fc" 
                            : isHovered ? "#f8fafc" : "#94a3b8",
                        textDecoration: "none",
                        overflow: "hidden" /* সাইড স্ক্রলবার চিরতরে বন্ধ করার জন্য */
                    }}
                >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                        <span style={{
                            position: "absolute", 
                            left: 0,
                            top: "50%", 
                            transform: "translateY(-50%)",
                            width: "4px", 
                            height: "18px",
                            background: "#6366f1", 
                            borderRadius: "0 4px 4px 0",
                        }} />
                    )}

                    {/* Icon Box */}
                    <span style={{
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        width: "24px", 
                        height: "24px", 
                        flexShrink: 0,
                        color: isActive ? "#818cf8" : "inherit",
                        transition: "color 0.2s",
                    }}>
                        <Icon size={18} />
                    </span>

                    {/* Label with forced single line */}
                    {showLabel && (
                        <span style={{ 
                            flex: 1, 
                            lineHeight: 1, 
                            whiteSpace: "nowrap", 
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {item.name}
                        </span>
                    )}
                </Link>

                {/* ── Fixed Tooltip: Fixed position ব্যবহার করা হয়েছে যাতে overflow প্রপার্টি একে লুকাতে না পারে ── */}
                {!showLabel && isHovered && (
                    <div 
                        style={{
                            position: "fixed", /* absolute থেকে fixed করায় স্ক্রল ডিভের বাইরে চলে আসবে */
                            left: "76px", 
                            // স্ক্রিনের সাপেক্ষে মাউস পজিশন অটো সিঙ্ক করার জন্য সিএসএস ট্রিকস
                            transform: "translateY(-38px)", 
                            background: "#0f172a", 
                            color: "#f8fafc",
                            fontSize: "12px", 
                            fontWeight: "500",
                            padding: "6px 12px", 
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            whiteSpace: "nowrap", 
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                            pointerEvents: "none",
                            zIndex: 999999
                        }}
                    >
                        {item.name}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = ({ showLabels, onItemClick }) => (
        <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            overflowX: "hidden", /* নিচে বা ডানে বামে স্ক্রলবার আসা টোটালি অফ */
            padding: "8px" 
        }}>
            {menuGroups.map((group, gi) => (
                <div key={gi} style={{ marginBottom: "16px" }}>
                    {gi > 0 && (
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "8px 4px 12px" }} />
                    )}
                    {showLabels && (
                        <p style={{
                            fontSize: "11px", 
                            fontWeight: 600,
                            textTransform: "uppercase", 
                            letterSpacing: "0.05em",
                            color: "#475569", 
                            padding: "0 12px", 
                            marginBottom: "8px",
                            whiteSpace: "nowrap",
                            overflow: "hidden"
                        }}>
                            {group.label}
                        </p>
                    )}
                    {group.items.map((item, ii) => (
                        <NavItem key={ii} item={item} showLabel={showLabels} onClick={onItemClick} />
                    ))}
                </div>
            ))}
        </div>
    );

    const UserCard = ({ showLabel }) => {
        const [logoutHovered, setLogoutHovered] = useState(false);
        return (
            <div style={{
                flexShrink: 0, 
                padding: "12px 8px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "#1e2e38",
                overflow: "hidden"
            }}>
                <div style={{
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: showLabel ? "space-between" : "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    position: "relative"
                }}>
                    {showLabel && (
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#94a3b8", whiteSpace: "nowrap" }}>
                            Logout
                        </span>
                    )}

                    <div 
                        style={{ position: "relative" }}
                        onMouseEnter={() => setLogoutHovered(true)}
                        onMouseLeave={() => setLogoutHovered(false)}
                    >
                        <Link
                            href={route('logout')} method="post" as="button"
                            style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                background: logoutHovered ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.1)", 
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#f87171", transition: "all 0.15s"
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </Link>

                        {!showLabel && logoutHovered && (
                            <div 
                                style={{
                                    position: "fixed",
                                    left: "76px", 
                                    transform: "translateY(-24px)",
                                    background: "#0f172a", 
                                    color: "#f8fafc",
                                    fontSize: "12px", 
                                    fontWeight: 500,
                                    padding: "6px 12px", 
                                    borderRadius: "6px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    whiteSpace: "nowrap", 
                                    zIndex: 999999,
                                }}
                            >
                                Logout
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside
                className="hidden lg:flex flex-col flex-shrink-0 sticky top-[64px] h-[calc(100vh-64px)]"
                style={{
                    width: collapsed ? "64px" : "240px",
                    background: "#1e2e38",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "visible", 
                    zIndex: 40 
                }}
            >
                {/* Collapse Button Header */}
                <div style={{
                    display: "flex",
                    justifyContent: collapsed ? "center" : "flex-end",
                    padding: "12px",
                    flexShrink: 0,
                    background: "#1e2e38",
                    borderBottom: "1px solid rgba(255,255,255,0.02)"
                }}>
                    <button
                        onClick={handleToggle}
                        style={{
                            width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer",
                            background: "rgba(255,255,255,0.04)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#94a3b8", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f8fafc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#94a3b8"; }}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        <FiChevronLeft
                            size={16}
                            style={{
                                transition: "transform 0.2s",
                                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </button>
                </div>

                <SidebarContent showLabels={!collapsed} onItemClick={undefined} />
                <UserCard showLabel={!collapsed} />
            </aside>

            {/* ── Mobile Drawer ── */}
            <div
                className="lg:hidden"
                style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    visibility: showingSidebar ? "visible" : "hidden",
                }}
            >
                <div
                    onClick={() => setShowingSidebar(false)}
                    style={{
                        position: "absolute", inset: 0,
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(4px)",
                        opacity: showingSidebar ? 1 : 0,
                        transition: "opacity 0.25s ease",
                    }}
                />

                <aside style={{
                    position: "absolute", top: 0, left: 0, bottom: 0,
                    width: "260px",
                    background: "#1e2e38",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", flexDirection: "column",
                    transform: showingSidebar ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                    <div style={{
                        height: 64, display: "flex", alignItems: "center",
                        justifyContent: "space-between", padding: "0 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: "rgba(167,243,208,0.12)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A7F3D0" strokeWidth="2.2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>
                                CoreERP
                            </span>
                        </div>
                        <button
                            onClick={() => setShowingSidebar(false)}
                            style={{
                                width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                                background: "rgba(255,255,255,0.05)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#94a3b8",
                            }}
                        >
                            <FiX size={14} />
                        </button>
                    </div>

                    <SidebarContent showLabels={true} onItemClick={() => setShowingSidebar(false)} />
                    <UserCard showLabel={true} />
                </aside>
            </div>
        </>
    );
}