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
        { label: 'Professors', href: '/professor' },
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
    <footer className="min-h-[100px] max-h-[160px] bg-background/95 border-t flex flex-col justify-between">
      <div className="px-4 md:px-6 pt-6 pb-2">
        <div className="mb-4 px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">
                This is an open source project. Contributions are welcome!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
                  <Star className="h-4 w-4" />
                  <span>Star</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                <Link href="https://github.com/OpenLake/RateMyCourse/fork" target="_blank" rel="noopener noreferrer">
                  <GitFork className="h-4 w-4" />
                  <span>Fork</span>
                </Link>
              </Button>
              <Button variant="default" size="sm" className="h-8 gap-1" asChild>
                <Link href="https://github.com/OpenLake/RateMyCourse/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
                  <Heart className="h-4 w-4" />
                  <span>Contribute</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">RateMyCourse</span>
              </Link>
              
              <div className="flex items-center mt-2">
                <Link 
                  href="https://openlakeweb.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Image src="https://raw.githubusercontent.com/OpenLake/Branding/refs/heads/main/Logos/OpenLake.png" alt="OL"
                           width={100}
                           height={100}
                    />
                  </div>
                  <span className="font-medium">An OpenLake Project</span>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground">
                A student-driven initiative making course selection easier for students at IIT Bhilai. Built with open source collaboration.
              </p>
              
              <div className="flex mt-2 space-x-4">
                <Link
                  href="https://github.com/OpenLake/RateMyCourse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
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
                <h3 className="text-sm font-medium text-foreground">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        target={"external" in link && link.external ? "_blank" : undefined}
                        rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                        {"external" in link && link.external && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
