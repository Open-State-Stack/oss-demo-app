export default function LoadingSpinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`${className} animate-spin rounded-full border-2 border-gray-300 border-t-yellow-600`} />
  );
}