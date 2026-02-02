import Link from 'next/link';
import Header from '@/components/Header';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Revalidate every 30 minutes — templates rarely change
export const revalidate = 1800;

const occasions = [
  { name: 'All', slug: 'all' },
  { name: "Valentine's", slug: 'valentines' },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Thank You', slug: 'thank-you' },
  { name: 'Congrats', slug: 'congratulations' },
  { name: 'Just Because', slug: 'just-because' },
  { name: 'Friendship', slug: 'friendship' },
  { name: 'Anniversary', slug: 'anniversary' },
  { name: 'Apology', slug: 'apology' },
  { name: 'Get Well', slug: 'get-well' },
];

// Valentines ordering (lower = first)
const VALENTINES_ORDER: Record<string, number> = {
  'Yes or No': 1,
  'Wrapped': 2,
  'Streaming Service': 3,
  'Fortune Cookie': 4,
  'Adventure Map': 5,
  'Open When Letters': 6,
  'Message in a Bottle': 7,
  'Scratch Card': 8,
};

// Templates that are coming soon (non-clickable)
const COMING_SOON = new Set(['3D Memory Room', 'Memory Room Adventure']);

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
  const allTemplates = await db
    .select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      occasion: templates.occasion,
      thumbnailUrl: templates.thumbnailUrl,
      basePrice: templates.basePrice,
    })
    .from(templates)
    .where(eq(templates.isActive, true));

  // Default to valentines when no occasion param
  const occasion = params.occasion || 'valentines';

  const filteredTemplates = occasion === 'all'
    ? allTemplates
    : allTemplates.filter((t) => t.occasion.includes(occasion));

  // Sort by valentines order (templates with defined order come first, rest alphabetical)
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    const aOrder = VALENTINES_ORDER[a.name] ?? 999;
    const bOrder = VALENTINES_ORDER[b.name] ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });

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
            const isActive = occasion === occ.slug;
            const isValentine = occ.slug === 'valentines';
            return (
              <Link
                key={occ.slug}
                href={occ.slug === 'valentines' ? '/templates' : `/templates?occasion=${occ.slug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? isValentine
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 animate-pulse'
                      : 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                    : 'glass text-gray-400 hover:text-white hover:bg-dark-600/80'
                }`}
              >
                {occ.name}
              </Link>
            );
          })}
        </div>

        {/* Templates Grid */}
        {sortedTemplates.length === 0 ? (
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
            {sortedTemplates.map((template) => {
              const accent = getTemplateAccent(template.name);
              const isComingSoon = COMING_SOON.has(template.name);

              if (isComingSoon) {
                return (
                  <div key={template.id} className="group opacity-50 cursor-not-allowed">
                    <div className="glass rounded-2xl overflow-hidden relative">
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] bg-dark-800 relative flex items-center justify-center overflow-hidden">
                        {template.thumbnailUrl ? (
                          <img
                            src={template.thumbnailUrl}
                            alt={template.name}
                            className="w-full h-full object-cover grayscale"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} />
                        )}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
                        {/* Coming Soon Badge */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="bg-dark-800/90 text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/10">
                            Coming Soon
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-white/60 font-semibold text-lg mb-1">
                          {template.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-600">
                            ${template.basePrice}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-gray-500">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
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
