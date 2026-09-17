import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Go home
      </Link>
    </div>
  );
}
