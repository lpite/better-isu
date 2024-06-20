
type PageHeaderProps = {
	name: string,
}

export default function PageHeader({ name }: PageHeaderProps) {
	return (
		<header className="px-3 pt-3 pb-2 flex items-center border-b">
			<h1 className="text-xl text-nowrap overflow-x-auto">{name}</h1>
		</header>
	)
}