import React, { useState } from 'react';
import type { Publication } from '../context/DataContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PublicationBrowserProps {
  publications: Publication[];
  selectedPublication: Publication | null;
  onPublicationClick: (pub: Publication) => void;
}

const PublicationBrowser: React.FC<PublicationBrowserProps> = ({
  publications,
  selectedPublication,
  onPublicationClick,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(
    selectedPublication?.pmid || null
  );
  const [filterKeyword, setFilterKeyword] = useState('');

  const filtered = publications.filter((pub) => {
    const keyword = filterKeyword.toLowerCase();
    return (
      pub.title.toLowerCase().includes(keyword) ||
      (pub.sampleType?.toLowerCase().includes(keyword) ?? false) ||
      (pub.enzymes?.toLowerCase().includes(keyword) ?? false)
    );
  });

  const getKeywords = (pub: Publication): string[] => {
    const keywords: string[] = [];
    if (pub.sampleType && pub.sampleType.length > 0) keywords.push(pub.sampleType);
    if (pub.enzymes && pub.enzymes.length > 0) keywords.push(pub.enzymes);
    if (pub.instrument && pub.instrument.length > 0) keywords.push(pub.instrument);
    return keywords.filter(Boolean).slice(0, 3);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold mb-3">Publications</h2>
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          {filtered.length} of {publications.length} publications
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {publications.length === 0 ? 'Select an institution' : 'No matching publications'}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((pub) => {
              const isExpanded = expandedId === pub.pmid;
              const keywords = getKeywords(pub);

              return (
                <div
                  key={pub.pmid}
                  className={`border-b transition-colors ${
                    isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : pub.pmid);
                      onPublicationClick(pub);
                    }}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
                          {pub.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {pub.lastAuthor} ({pub.year})
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterKeyword(kw);
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 bg-blue-50 border-t">
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-700">Summary</p>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {pub.summary || 'No summary available'}
                          </p>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700">Metadata</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>
                              <strong>Journal:</strong> {pub.journal}
                            </p>
                            <p>
                              <strong>Institute:</strong> {pub.institute}
                            </p>
                            <p>
                              <strong>Location:</strong> {pub.city}, {pub.country}
                            </p>
                            <p>
                              <strong>PMID:</strong> {pub.pmid}
                            </p>
                          </div>
                        </div>

                        {(pub.sampleType || pub.enzymes || pub.instrument) && (
                          <div>
                            <p className="font-semibold text-gray-700">Details</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              {pub.sampleType && (
                                <p>
                                  <strong>Sample Type:</strong> {pub.sampleType}
                                </p>
                              )}
                              {pub.enzymes && (
                                <p>
                                  <strong>Enzymes:</strong> {pub.enzymes}
                                </p>
                              )}
                              {pub.instrument && (
                                <p>
                                  <strong>Instrument:</strong> {pub.instrument}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationBrowser;
