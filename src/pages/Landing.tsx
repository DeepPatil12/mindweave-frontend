import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-foreground">
              NeuroMatch
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="#learn-more">Learn More</a>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              {/* Central Brain */}
              <div className="absolute inset-0 gradient-hero rounded-full animate-float shadow-glow" />
              
              {/* Floating Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-medium">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center shadow-medium">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-medium">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-secondary-dark rounded-full flex items-center justify-center shadow-medium">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>
              
              {/* Center Brain Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Find people who{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                think like you
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              NeuroMatch uses AI to understand your unique thinking patterns and connect you 
              with minds that truly resonate with yours. Privacy-first, pseudonym-only matching.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">Start Your Mindprint</Link>
            </Button>
            <Button variant="ghost-primary" size="xl" asChild>
              <a href="#learn-more">Learn More</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How NeuroMatch Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to find your neural connections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="card-elevated p-8 text-center group hover:shadow-large transition-all duration-300"
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Create Your Mindprint
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Answer thoughtful questions that reveal your unique thinking patterns, 
                emotional depth, and cognitive style.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="card-elevated p-8 text-center group hover:shadow-large transition-all duration-300"
            >
              <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                AI Analysis
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our neural network analyzes your responses to map your cognitive fingerprint 
                and identify compatible thinking styles.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="card-elevated p-8 text-center group hover:shadow-large transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Meet Your Matches
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with people who share your mental wavelength through 
                AI-curated conversations and meaningful interactions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-muted-foreground to-muted-foreground/80 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Privacy-First Connection
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your real identity stays protected. NeuroMatch uses pseudonyms only, 
              ensuring authentic connections based on minds, not profiles.
            </p>
            
            <div className="text-sm text-muted-foreground">
              Pseudonyms only. Real connections.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">NeuroMatch</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 NeuroMatch. Privacy-first neural connections.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;