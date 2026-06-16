interface SnipeSuccessProps {
  message: string;
}

export default function SnipeSuccess({ message }: SnipeSuccessProps) {
  return (
    <div className="glass-panel p-4 text-sm text-hub-green flex items-center gap-2 border-hub-green/20 bg-hub-green-light/50">
      <span>✓</span> {message}
    </div>
  );
}
