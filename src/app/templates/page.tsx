import Link from 'next/link';
import Header from '@/components/Header';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const occasions = [
  { name: 'All', slug: undefined },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Thank You', slug: 'thank-you' },
  { name: 'Congrats', slug: 'congratulations' },
  { name: 'Just Because', slug: 'just-because' },
  { name: "Valentine's", slug: 'valentines' },
  { name: 'Friendship', slug: 'friendship' },
  { name: 'Anniversary', slug: 'anniversary' },
  { name: 'Apology', slug: 'apology' },
  { name: 'Get Well', slug: 'get-well' },
];

// Map template types to accent colors for card gradient bars
function getTemplateAccent(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('yes') || lower.includes('question') || lower.includes('valentine'))
    return 'from-accent-purple to-accent-pink';
  if (lower.includes('meme'))
    return 'from-accent-pink to-accent-orange';
  if (lower.includes('countdown') || lower.includes('timer'))
    return 'from-accent-blue to-accent-purple';
  if (lower.includes('scratch'))
    return 'from-accent-orange to-accent-yellow';
  if (lower.includes('fortune') || lower.includes('cookie'))
    return 'from-accent-yellow to-accent-orange';
  if (lower.includes('bottle') || lower.includes('message'))
    return 'from-accent-teal to-accent-blue';
  if (lower.includes('spotify') || lower.includes('wrapped'))
    return 'from-accent-green to-accent-teal';
  if (lower.includes('polaroid') || lower.includes('photo'))
    return 'from-accent-pink to-accent-purple';
  if (lower.includes('3d') || lower.includes('memory room'))
    return 'from-accent-purple to-accent-blue';
  if (lower.includes('birthday'))
    return 'from-accent-orange to-accent-yellow';
  if (lower.includes('thank'))
    return 'from-accent-teal to-accent-green';
  return 'from-accent-purple to-accent-pink';
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const params = await searchParams;
  const allTemplates = await db.select().from(templates).where(eq(templates.isActive, true));
  const occasion = params.occasion;

  const filteredTemplates = occasion
    ? allTemplates.filter((t) => t.occasion.includes(occasion))
    : allTemplates;

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-white mb-3">
            Templates
          </h1>
          <p className="text-gray-400 text-lg">
            Pick one, customize it, send it. Done.
          </p>
        </div>

        {/* Occasion Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {occasions.map((occ) => {
            const isActive = occasion === occ.slug || (!occasion && !occ.slug);
            return (
              <Link
                key={occ.slug || 'all'}
                href={occ.slug ? `/templates?occasion=${occ.slug}` : '/templates'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                    : 'glass text-gray-400 hover:text-white hover:bg-dark-600/80'
                }`}
              >
                {occ.name}
              </Link>
            );
          })}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Check back soon or try a different occasion.
              </p>
              <Link
                href="/templates"
                className="text-accent-purple hover:text-accent-pink text-sm font-medium transition-colors"
              >
                View all templates &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {filteredTemplates.map((template) => {
              const accent = getTemplateAccent(template.name);
              
              return (
                <Link
                  key={template.id}
                  href={`/customize/${template.id}`}
                  className="group"
                >
                  <div className="glass rounded-2xl overflow-hidden hover:bg-dark-700/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-purple/5">
                    {/* Thumbnail */}
                    <div className="aspect-[16/10] bg-dark-800 relative flex items-center justify-center overflow-hidden">
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
                      )}
                      {/* Top gradient accent bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-accent-purple transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gradient bg-gradient-to-r from-accent-purple to-accent-pink">
                          ${template.basePrice}
                        </span>
                        <div className="flex gap-1.5">
                          {template.occasion.slice(0, 3).map((o) => (
                            <span
                              key={o}
                              className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-gray-400"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
