type PageHeadingProps = {
  title: string;
  description?: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </div>
  );
}
