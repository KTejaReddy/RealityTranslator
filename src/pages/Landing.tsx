import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe2, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05070e] overflow-hidden relative font-body flex items-center justify-center selection:bg-primary/30">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '10s', animationDelay: '4s' }} />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
          <Globe2 className="w-24 h-24 text-primary relative z-10 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-display font-bold text-white tracking-tight mb-6"
        >
          Reality <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-accent glow-text-cyan">Translator</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed mb-12"
        >
          The ultimate AI-powered sandbox. Describe any system, ecosystem, or concept, and watch it manifest as a beautiful, interactive 3D simulation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button 
            onClick={() => navigate('/login-user')}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full font-semibold text-white transition-all duration-300 overflow-hidden flex items-center gap-3 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.1)] hover:shadow-[0_0_60px_rgba(0,255,255,0.25)] hover:border-primary/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
            <span className="relative z-10 tracking-wide">User Login</span>
            <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => navigate('/login-government')}
            className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full font-semibold text-white transition-all duration-300 overflow-hidden flex items-center gap-3 backdrop-blur-xl shadow-[0_0_40px_rgba(255,0,255,0.1)] hover:shadow-[0_0_60px_rgba(255,0,255,0.25)] hover:border-accent/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Globe2 className="w-5 h-5 text-accent group-hover:animate-pulse" />
            <span className="relative z-10 tracking-wide">Official Login</span>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto border-t border-white/10 pt-12"
        >
          <div className="glass-panel p-6 rounded-2xl bg-white/[0.02]">
            <h3 className="text-primary font-display font-semibold text-lg mb-2">Infinite Scenarios</h3>
            <p className="text-sm text-white/50 leading-relaxed">From Mars colonies to microscopic biology, simulate literally anything imaginable utilizing advanced generative AI frameworks.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl bg-white/[0.02]">
            <h3 className="text-accent font-display font-semibold text-lg mb-2">Stunning 3D Fidelity</h3>
            <p className="text-sm text-white/50 leading-relaxed">Experience a breathtaking, cinematic physics engine with real-time bloom, ambient lighting, and rich procedural rendering.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl bg-white/[0.02]">
            <h3 className="text-cyan-400 font-display font-semibold text-lg mb-2">Real-Time Metrics</h3>
            <p className="text-sm text-white/50 leading-relaxed">Every simulation intelligently models complex interconnected variables, providing live analytics and responsive feedback.</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Landing;
