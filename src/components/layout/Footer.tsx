import Link from 'next/link';
import { BookOpen, Github, Star, GitFork, Heart, ExternalLink, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Resources',
      links: [
        { label: 'Courses', href: '/courses' },
        { label: 'Professors', href: '/professors' },
        { label: 'About', href: '/about' },
        { label: 'Contribute', href: 'https://github.com/OpenLake/RateMyCourse/blob/main/CONTRIBUTING.md' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'LinkedIn', href: 'https://discord.com/invite/openlake', external: true },
        { label: 'GitHub', href: 'https://github.com/OpenLake', external: true },
        { label: 'Instagram', href: 'https://github.com/OpenLake/RateMyCourse/blob/main/CODE_OF_CONDUCT.md', external: true },
        { label: 'OpenLake Website', href: 'https://openlakeweb.vercel.app/', external: true },
      ],
    },
    {
      title: 'Contribute',
      links: [
        { label: 'Report Issues', href: 'https://github.com/OpenLake/RateMyCourse/issues', external: true },
        { label: 'Feature Requests', href: 'https://github.com/OpenLake/RateMyCourse/issues/new?labels=enhancement', external: true },
      ],
    },
  ];

  return (
    <footer className="min-h-[100px] bg-background/95 backdrop-blur-sm border-t border-border/60 flex flex-col justify-between relative">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      
      <div className="px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6 px-4 py-3 rounded-lg bg-card/50 border border-border/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Code className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-bold tracking-wide">
                Open Source Project — Contributions Welcome!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 relative overflow-hidden group" 
                asChild
              >
                <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <Star className="h-3.5 w-3.5 group-hover:rotate-12 group-hover:fill-primary/20 transition-all duration-300 relative" />
                  <span className="relative font-mono">Star</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 relative overflow-hidden group" 
                asChild
              >
                <Link href="https://github.com/OpenLake/RateMyCourse/fork" target="_blank" rel="noopener noreferrer">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <GitFork className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300 relative" />
                  <span className="relative font-mono">Fork</span>
                </Link>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 gap-1.5 relative overflow-hidden group" 
                asChild
              >
                <Link href="https://github.com/OpenLake/RateMyCourse/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <Heart className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300 relative" />
                  <span className="relative font-mono">Contribute</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:rotate-12 transition-transform duration-300 relative z-10" />
            <span className="font-black text-lg sm:text-xl tracking-tight group-hover:text-primary transition-colors duration-300 relative z-10">
              <span className="hidden xs:inline">RateMyCourse</span>
              <span className="xs:hidden font-mono">RateMyCourse</span>
            </span>
              </Link>
              
              <div className="flex items-center mt-2">
                <Link 
                  href="https://openlakeweb.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Image src="https://raw.githubusercontent.com/OpenLake/Branding/refs/heads/main/Logos/OpenLake.png" alt="OL"
                           width={100}
                           height={100}
                           className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="font-bold text-sm tracking-wide">An OpenLake Project</span>
                </Link>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed tracking-wide font-bold">
                A student-driven initiative making course selection easier for students at IIT Bhilai. Built with open source collaboration.
              </p>
              
              <div className="flex mt-2 space-x-4">
                <Link
                  href="https://github.com/OpenLake/RateMyCourse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-[10px] font-mono font-bold text-foreground uppercase tracking-[0.15em]">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-1.5 group tracking-wide"
                        target={"external" in link && link.external ? "_blank" : undefined}
                        rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform duration-300">{link.label}</span>
                        {"external" in link && link.external && (
                          <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border/40">
          <p className="text-center text-xs font-mono text-muted-foreground tracking-wider">
            © {currentYear} <span className="font-bold">RateMyCourse</span> — Built with <Heart className="h-3 w-3 inline text-primary" /> by OpenLake
          </p>
        </div>
      </div>
    </footer>
  );
}