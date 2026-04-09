'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { DocsSidebar, DocsContent, TableOfContents } from '@/components/docs';
import { PageTransition } from '@/components/ios';
import { RepositoryGrid } from '@/components/resources';
import { type DocNode } from '@/lib/docs';
import { cn } from '@/lib/utils';

interface WikiPageClientProps {
  doc: DocNode;
  tree: DocNode[];
  breadcrumbs: Array<{ title: string; path: string }>;
}

export default function WikiPageClient({ doc, tree, breadcrumbs }: WikiPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Could trigger command palette or inline search results
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-72"
              >
                <div className="h-full bg-background border-r border-border">
                  <div className="flex items-center justify-end p-4">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Close navigation"
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                  <DocsSidebar
                    tree={tree}
                    onSearch={handleSearch}
                    className="h-[calc(100%-72px)]"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Layout */}
        <div className="flex">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
            <DocsSidebar
              tree={tree}
              onSearch={handleSearch}
              className="h-full"
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              {/* Back link - Desktop */}
              <div className="hidden lg:block mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>

              {/* Content */}
              <div className="flex gap-8">
                <div className="flex-1 min-w-0">
                  {/* Check for special pages with custom components */}
                  {doc.path === 'reference/repositories' ? (
                    <RepositoriesPageContent breadcrumbs={breadcrumbs} />
                  ) : (
                    <DocsContent
                      doc={doc}
                      breadcrumbs={breadcrumbs}
                    />
                  )}
                </div>

                {/* Table of Contents - Desktop (hide for custom pages) */}
                {doc.path !== 'reference/repositories' && doc.headings && doc.headings.length > 0 && (
                  <TableOfContents
                    headings={doc.headings}
                    className="hidden xl:block"
                  />
                )}
              </div>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                  <p>
                    Built with craft and attention to detail
                  </p>
                  <div className="flex items-center gap-4">
                    <Link href="/wiki/reference/attributions" className="hover:text-foreground transition-colors">
                      Attributions
                    </Link>
                    <span>•</span>
                    <Link href="https://github.com/8gi-foundation/resume" className="hover:text-foreground transition-colors">
                      GitHub
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
}

/**
 * Custom content component for the Repositories page
 */
function RepositoriesPageContent({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ title: string; path: string }>;
}) {
  return (
    <article className="max-w-none">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.title}</span>
            ) : (
              <Link
                href={crumb.path}
                className="hover:text-foreground transition-colors"
              >
                {crumb.title}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
          Repositories
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Curated open source repositories for building intelligent applications.
          Browse by category or search to find the perfect tools for your project.
        </p>
      </motion.header>

      {/* Repository Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <RepositoryGrid />
      </motion.div>
    </article>
  );
}
