type PageHeaderProps = {
  name: string;
};

export default function PageHeader({ name }: PageHeaderProps) {
  return (
    <header className="px-3 pt-3 pb-2 flex items-center border-b overflow-x-auto">
      <h1 className="text-xl text-nowrap whitespace-nowrap">{name}</h1>
    </header>
  );
}
