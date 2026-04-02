type CardElementProps = {
  cardTitle: string;
  value: number | string;
  borderBottomColor:
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "secondary"
    | "muted";
};

const borderColorMap = {
  primary: "border-primary",
  success: "border-green-500",
  warning: "border-yellow-500",
  error: "border-red-500",
  secondary: "border-secondary",
  muted: "border-muted",
};

const DashboardCard = ({
  cardTitle,
  value,
  borderBottomColor,
}: CardElementProps) => {
  return (
    <div
      className={`sm:w-40 rounded-lg border p-4 ${borderColorMap[borderBottomColor]}`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{cardTitle}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;