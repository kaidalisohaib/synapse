import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Connect your</span>{' '}
                  <span className="block text-red-600 xl:inline">curiosity</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Synapse is a curiosity connector for McGill students. Submit your questions and get matched with fellow students from different faculties for interdisciplinary conversations.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/signup">
                      <Button size="lg" className="w-full px-8 py-3">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="w-full px-8 py-3">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-red-50 to-red-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-6xl text-red-200">🧠</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              How Synapse Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Simple, automated connections that foster interdisciplinary learning.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <span className="text-xl">❓</span>
                </div>
                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Submit Your Curiosity</h3>
                <p className="mt-2 text-base text-gray-500">
                  Ask any question or express curiosity about topics outside your field of study.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <span className="text-xl">🔗</span>
                </div>
                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Get Matched</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our algorithm finds students from different faculties who can help with your question.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <span className="text-xl">💬</span>
                </div>
                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Connect & Learn</h3>
                <p className="mt-2 text-base text-gray-500">
                  Have meaningful conversations that expand your perspective and knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
