import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>FitTour</title>
        <meta name="description" content="Stay fit while you travel" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to FitTour</h1>
        <p className="text-lg mt-4 text-gray-600">Stay fit while you travel. Personalized workouts, no gym needed.</p>
        <button className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:opacity-90">Get Started</button>
      </main>
    </>
  );
}
