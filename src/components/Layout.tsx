import { PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren; // {children: ReactElement[] & { length: 3 };};
/** Dynamically lays out the application on mobile and desktop. Expects 3 children in this order: MainArea, Sidebar, and InfoBar.*/
export function Layout({ children }: LayoutProps) {
    return <div className="flex h-full flex-row">{children}</div>;
}

export type BodyProps = PropsWithChildren<{}>;
export function Body({ children }: BodyProps) {
    return <div className="flex h-full flex-grow flex-row">{children}</div>;
}

export type InfoPanelProps = PropsWithChildren<{}>;
export function InfoPanel({ children }: InfoPanelProps) {
    return <div className="w-1/6 flex-initial">{children}</div>;
}

export type SidebarProps = PropsWithChildren<{}>;
export function Sidebar({ children }: SidebarProps) {
    return (
        <div className="flex w-1/6 flex-initial flex-col bg-slate-200">
            {children}
        </div>
    );
}
