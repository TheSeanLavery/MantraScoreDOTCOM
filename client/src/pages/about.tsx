import { Link } from "@/components/ui/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Linkedin, Github, Coffee, Calendar, Twitter } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center items-center mb-3">
          <img 
            src="/cropped_glow_icon.png" 
            alt="MantraScore Logo" 
            className="h-12 w-auto mr-3" 
          />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            <span className="text-teal-500">Mantra</span>
            <span className="text-amber-400">Score</span>.com
          </h1>
        </div>
        <p className="text-slate-600 mb-4">Track your daily affirmations and mindful speech patterns</p>
        <Link href="/" className="inline-flex items-center text-teal-500 hover:text-teal-600">
          <Home className="h-4 w-4 mr-2" />
          Return to App
        </Link>
      </header>

      <div className="grid gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>About MantraScore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              MantraScore is a tool designed to help you track and improve your daily affirmations and speech patterns.
              By becoming more conscious of what you say, you can cultivate more positive thinking and self-talk.
            </p>
            <p>
              Features include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Track positive affirmations and negative speech patterns</li>
              <li>Set targets for how many times you want to say empowering phrases</li>
              <li>Calendar view to track your progress day by day</li>
              <li>Export and import your data for backup and portability</li>
              <li>100% private - all data is stored locally in your browser</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Created by Sean Lavery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">💼 Professional</h3>
                <div className="space-y-2">
                  <a 
                    href="https://linkedin.com/in/sean-lavery" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    linkedin.com/in/sean-lavery
                  </a>
                  <a 
                    href="https://github.com/TheSeanLavery" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    github.com/TheSeanLavery
                  </a>
                </div>

                <h3 className="text-lg font-medium">☕ Support & Referrals</h3>
                <div className="space-y-2">
                  <a 
                    href="https://buymeacoffee.com/seanlavery" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    buymeacoffee.com/seanlavery
                  </a>
                  <a 
                    href="https://replit.com/refer/theseanlavery" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">R</span>
                    replit.com/refer/theseanlavery
                  </a>
                  <a 
                    href="https://windsurf.com/refer?referral_code=b6db9e7ac1" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">W</span>
                    windsurf.com/refer?referral_code=b6db9e7ac1
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">🐦 Social</h3>
                <div className="space-y-2">
                  <a 
                    href="https://x.com/CyborgLavery" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    x.com/CyborgLavery
                  </a>
                </div>

                <h3 className="text-lg font-medium">📆 Calendly – Book a Session</h3>
                <div className="space-y-2">
                  <a 
                    href="https://calendly.com/seanlavery/powerlevel" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    1-Hour Powerleveling
                  </a>
                  <a 
                    href="https://calendly.com/seanlavery/30min" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    30-Minute Session
                  </a>
                </div>

                <h3 className="text-lg font-medium">🌐 Projects</h3>
                <div className="space-y-2">
                  <a 
                    href="https://powerlevelai.com" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-teal-500 hover:underline"
                  >
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">⚡</span>
                    PowerLevelAI: powerlevelai.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              MantraScore is an open-source project licensed under the MIT License. You can view, fork, or contribute to the codebase on GitHub.
            </p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <a 
                href="https://github.com/TheSeanLavery/MantraScoreDOTCOM" 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
              <a 
                href="/license.txt" 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-white py-2 px-4 rounded"
              >
                <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">©</span>
                MIT License
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center text-sm text-slate-500 mt-8 border-t pt-8">
        <p>© {new Date().getFullYear()} MantraScore.com | Created by Sean Lavery</p>
        <p className="mt-2">All data is stored locally in your browser. No audio or transcript data is sent to any server.</p>
      </footer>
    </div>
  );
} 