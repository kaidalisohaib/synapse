import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        {/* Neural Network Animation */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
          {/* Animated connection lines */}
          <g className="animate-pulse">
            <line x1="100" y1="200" x2="300" y2="150" stroke="url(#connectionGradient)" strokeWidth="2"/>
            <line x1="300" y1="150" x2="500" y2="250" stroke="url(#connectionGradient)" strokeWidth="2"/>
            <line x1="500" y1="250" x2="700" y2="180" stroke="url(#connectionGradient)" strokeWidth="2"/>
            <line x1="200" y1="400" x2="400" y2="350" stroke="url(#connectionGradient)" strokeWidth="2"/>
            <line x1="400" y1="350" x2="600" y2="450" stroke="url(#connectionGradient)" strokeWidth="2"/>
            <line x1="600" y1="450" x2="800" y2="380" stroke="url(#connectionGradient)" strokeWidth="2"/>
          </g>
          {/* Neural nodes */}
          <circle cx="100" cy="200" r="8" fill="#8B5CF6" className="animate-pulse"/>
          <circle cx="300" cy="150" r="6" fill="#EC4899" className="animate-pulse"/>
          <circle cx="500" cy="250" r="10" fill="#8B5CF6" className="animate-pulse"/>
          <circle cx="700" cy="180" r="7" fill="#EC4899" className="animate-pulse"/>
          <circle cx="200" cy="400" r="9" fill="#8B5CF6" className="animate-pulse"/>
          <circle cx="400" cy="350" r="5" fill="#EC4899" className="animate-pulse"/>
          <circle cx="600" cy="450" r="8" fill="#8B5CF6" className="animate-pulse"/>
          <circle cx="800" cy="380" r="6" fill="#EC4899" className="animate-pulse"/>
        </svg>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="flex items-center mb-6 sm:justify-center lg:justify-start">
                  <div className="relative">
                    <div className="text-6xl animate-pulse">🧠</div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-300"></div>
                  </div>
                  <div className="ml-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Synapse
                  </div>
                </div>
                
                <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Spark neural</span>{' '}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 xl:inline animate-pulse">
                    connections
                  </span>
                </h1>
                
                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Where curiosity meets knowledge. Connect with McGill students across faculties and ignite 
                  <span className="text-purple-400 font-semibold"> interdisciplinary conversations</span> that expand your mind.
                </p>
                
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <span className="flex items-center">
                        ⚡ Start Connecting
                      </span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white rounded-xl transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Right side visual */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center relative">
            {/* Floating connection nodes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce delay-100"></div>
              <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-40 animate-bounce delay-300"></div>
              <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-30 animate-bounce delay-500"></div>
              <div className="absolute bottom-1/4 right-1/3 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full opacity-50 animate-bounce delay-700"></div>
            </div>
            
            {/* Central brain icon with pulsing effect */}
            <div className="relative z-10">
              <div className="text-8xl animate-pulse">🧠</div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-400 font-semibold tracking-wide uppercase animate-pulse">
              Neural Pathways
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-white sm:text-4xl">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Synapse</span> Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
              Three simple steps to ignite interdisciplinary connections and expand your intellectual horizons.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mx-auto">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <h3 className="mt-8 text-xl leading-6 font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                  Spark Your Curiosity
                </h3>
                <p className="mt-4 text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Submit questions that ignite your curiosity about topics beyond your field. 
                  <span className="text-purple-400 font-medium"> Every question is a neural pathway waiting to connect.</span>
                </p>
              </div>

              {/* Connection line */}
              <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 animate-pulse transform -translate-y-1/2"></div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mx-auto">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mx-auto shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 group-hover:scale-110">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-400 rounded-full animate-ping opacity-75 delay-300"></div>
                </div>
                <h3 className="mt-8 text-xl leading-6 font-semibold text-white group-hover:text-pink-400 transition-colors duration-300">
                  Neural Matching
                </h3>
                <p className="mt-4 text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Our intelligent algorithm creates synaptic connections, finding students whose knowledge 
                  <span className="text-pink-400 font-medium"> resonates with your curiosity frequency.</span>
                </p>
              </div>

              {/* Connection line */}
              <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 opacity-50 animate-pulse transform -translate-y-1/2 delay-500"></div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mx-auto">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 mx-auto shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-400 rounded-full animate-ping opacity-75 delay-700"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink-400 rounded-full animate-ping opacity-75 delay-1000"></div>
                </div>
                <h3 className="mt-8 text-xl leading-6 font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                  Synaptic Learning
                </h3>
                <p className="mt-4 text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  Engage in transformative conversations that create lasting neural pathways. 
                  <span className="text-purple-400 font-medium"> Watch your intellectual network expand exponentially.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 relative overflow-hidden">
        {/* Floating neural nodes background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Building the 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Neural Network</span> of Knowledge
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-300">
                Synapse creates synaptic connections between brilliant minds at McGill. 
                Our platform facilitates the formation of intellectual neural pathways, 
                <span className="text-purple-400 font-medium"> bridging disciplines and expanding consciousness.</span>
              </p>
              
              <div className="mt-10 space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                      <span className="text-lg">🎓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                      McGill Neural Network
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Exclusively connecting current McGill students, faculty, and staff in a secure academic environment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300">
                      <span className="text-lg">🔒</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors duration-300">
                      Secure Synapses
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      All neural connections require mutual consent. Your intellectual journey is protected and voluntary.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                      <span className="text-lg">🔬</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                      Research Catalyst
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Contributing to groundbreaking research on interdisciplinary learning and neural connection patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                {/* Glowing card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-500/20 shadow-2xl">
                  {/* Animated brain with connections */}
                  <div className="relative mb-6">
                    <div className="text-7xl animate-pulse">🧠</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-ping"></div>
                    
                    {/* Floating connection points */}
                    <div className="absolute -top-4 -left-4 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="absolute -top-2 -right-6 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute -bottom-4 -left-2 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-500"></div>
                    <div className="absolute -bottom-2 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-700"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Connect?</span>
                  </h3>
                  <p className="text-gray-300 mb-8 text-lg">
                    Join the neural network and start forming 
                    <span className="text-purple-400 font-medium"> synaptic connections</span> with brilliant minds.
                  </p>
                  
                  <Link href="/signup">
                    <Button size="lg" className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <span className="flex items-center">
                        ⚡ Activate Neural Link
                      </span>
                    </Button>
                  </Link>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
