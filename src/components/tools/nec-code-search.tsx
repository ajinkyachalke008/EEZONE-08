'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  article: string;
  section: string;
  title: string;
  content: string;
  relevance: number;
}

const necDatabase = [
  {
    article: '210',
    section: '210.8',
    title: 'GFCI Protection',
    content: 'Ground-fault circuit-interrupter protection shall be provided for all 125-volt, single-phase, 15- and 20-ampere receptacles installed in bathrooms, garages, outdoors, crawl spaces, unfinished basements, kitchens, and laundry areas.',
    keywords: ['gfci', 'ground fault', 'protection', 'receptacle', 'bathroom', 'kitchen', 'garage', 'outdoor']
  },
  {
    article: '210',
    section: '210.12',
    title: 'Arc-Fault Circuit-Interrupter Protection',
    content: 'All 120-volt, single phase, 15 and 20 ampere branch circuits supplying outlets or devices installed in dwelling unit family rooms, dining rooms, living rooms, parlors, libraries, dens, bedrooms, sunrooms, recreation rooms, closets, hallways, laundry areas, and similar rooms or areas shall be protected by any of the means described in 210.12(A)(1) through (A)(6).',
    keywords: ['afci', 'arc fault', 'protection', 'dwelling', 'bedroom', 'living room']
  },
  {
    article: '220',
    section: '220.12',
    title: 'Lighting Load',
    content: 'A unit load of not less than that specified in Table 220.12 for occupancies listed therein shall constitute the minimum lighting load. The floor area for each floor shall be calculated from the outside dimensions of the building.',
    keywords: ['lighting', 'load', 'calculation', 'unit load', 'floor area']
  },
  {
    article: '230',
    section: '230.79',
    title: 'Service Disconnecting Means Rating',
    content: 'The service disconnecting means shall have a rating of not less than 60 amperes for installations consisting of not more than two 2-wire branch circuits. For installations consisting of more than two 2-wire branch circuits, the service disconnecting means shall have a rating of not less than 100 amperes, 3-wire.',
    keywords: ['service', 'disconnect', 'rating', 'ampere', '100 amp', '60 amp']
  },
  {
    article: '250',
    section: '250.66',
    title: 'Size of Grounding Electrode Conductor',
    content: 'The size of the grounding electrode conductor at the service, at each building or structure where supplied by a feeder(s) or branch circuit(s), or at a separately derived system shall be as specified in Table 250.66, except as permitted elsewhere in this Code.',
    keywords: ['grounding', 'electrode', 'conductor', 'size', 'service']
  },
  {
    article: '310',
    section: '310.15',
    title: 'Ampacity of Conductors',
    content: 'Tables 310.15(B)(16) through 310.15(B)(21) and the associated notes shall be used to determine the ampacity of conductors rated 0 through 2000 volts. The maximum continuous ampere rating of a conductor shall be selected from the appropriate table.',
    keywords: ['ampacity', 'conductor', 'wire', 'current', 'rating', 'table']
  },
  {
    article: '334',
    section: '334.80',
    title: 'NM Cable Ampacity',
    content: 'The ampacity of Types NM, NMC, and NMS cable shall be determined in accordance with 310.15. The ampacity shall be in accordance with the 60°C conductor temperature rating.',
    keywords: ['nm cable', 'romex', 'ampacity', 'temperature']
  },
  {
    article: '406',
    section: '406.12',
    title: 'Tamper-Resistant Receptacles',
    content: 'In all areas specified in 210.52, all nonlocking-type 125-volt, 15- and 20-ampere receptacles shall be listed tamper-resistant receptacles.',
    keywords: ['tamper resistant', 'receptacle', 'tr', 'outlet']
  },
  {
    article: '410',
    section: '410.116',
    title: 'Recessed Luminaire Clearance',
    content: 'Recessed luminaires shall be installed so that adjacent combustible material is not subjected to temperatures in excess of 90°C (194°F). A recessed luminaire identified for contact with insulation, Type IC, shall be permitted to be in contact with combustible material.',
    keywords: ['recessed', 'light', 'fixture', 'luminaire', 'insulation', 'ic rated', 'clearance']
  },
  {
    article: '422',
    section: '422.16',
    title: 'Flexible Cords for Fixed Appliances',
    content: 'Flexible cord shall be permitted (1) for the connection of appliances to facilitate their frequent interchange or to prevent the transmission of noise or vibration or (2) to facilitate the removal or disconnection of appliances that are fastened in place.',
    keywords: ['flexible cord', 'appliance', 'connection']
  }
];

export function NECCodeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [necVersion, setNecVersion] = useState('2023');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = necDatabase
        .map(item => {
          // Calculate relevance score
          let relevance = 0;
          
          // Check if query matches keywords
          const matchedKeywords = item.keywords.filter(keyword => 
            keyword.includes(query) || query.includes(keyword)
          );
          relevance += matchedKeywords.length * 20;

          // Check title match
          if (item.title.toLowerCase().includes(query)) {
            relevance += 30;
          }

          // Check content match
          if (item.content.toLowerCase().includes(query)) {
            relevance += 10;
          }

          // Check article/section match
          if (item.article.includes(query) || item.section.includes(query)) {
            relevance += 50;
          }

          return {
            ...item,
            relevance
          };
        })
        .filter(item => item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);

      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const popularSearches = [
    'GFCI requirements',
    'AFCI protection',
    'Wire ampacity',
    'Service disconnect',
    'Grounding',
    'Recessed lighting',
    'Tamper resistant outlets'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NEC Code Search</CardTitle>
          <CardDescription>
            AI-powered search through the National Electrical Code (NEC {necVersion})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Select value={necVersion} onValueChange={setNecVersion}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">NEC 2023</SelectItem>
                  <SelectItem value="2020">NEC 2020</SelectItem>
                  <SelectItem value="2017">NEC 2017</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by article, keyword, or requirement (e.g., 'GFCI bathroom', '210.8', 'wire ampacity')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>

              <Button 
                onClick={performSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Popular searches:</Label>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSearchQuery(search);
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Search Results ({searchResults.length})
                </h3>
                <Badge variant="outline">NEC {necVersion}</Badge>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-[#071428] text-white">
                              Article {result.article}
                            </Badge>
                            <Badge variant="outline">
                              Section {result.section}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.relevance}% match
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-[#071428]">
                            {result.title}
                          </CardTitle>
                        </div>
                        <BookOpen className="h-5 w-5 text-[#00C2D1] flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try different keywords or browse popular searches above
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!searchQuery && searchResults.length === 0 && (
            <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
              <CardContent className="py-12">
                <Search className="h-16 w-16 text-[#00C2D1] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-3">
                  Search the NEC {necVersion} Code
                </h3>
                <p className="text-gray-300 text-center max-w-2xl mx-auto">
                  Enter article numbers (e.g., "210.8"), keywords (e.g., "GFCI"), or 
                  describe what you're looking for (e.g., "bathroom outlet requirements")
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
