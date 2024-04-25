import { appPath } from "~/config/appPath"

export interface NavItem {
    label?:string
    subLabel?:string
    children?:Array<NavItem>
    href?:string
}

export const NAV_ITEMS: Array<NavItem> = [
    {
        label: 'Dashboard',
        children: appPath.map((category)=>({
            label: category.name,
            subLabel: category.subLabel,
            href:`/${category.id}/${category.children?.[0].id}`
        }))
    },
    {
        label: 'About',
        href: '/about'
    }
]