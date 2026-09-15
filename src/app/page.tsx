import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-white">
      <h1 className="text-3xl font-semibold">QR AR/VR</h1>
      <p className="max-w-md text-neutral-400">
        Genera códigos QR dinámicos que abren experiencias de video, motion
        flyers o modelos 3D en realidad aumentada directamente en el
        navegador.
      </p>
      <Link
        href="/admin"
        className="rounded-full bg-white px-6 py-2.5 font-medium text-black transition hover:bg-neutral-200"
      >
        Ir al panel de administración
      </Link>
    </main>
  );
}
