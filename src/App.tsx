
import React, { useState, useMemo, useEffect } from 'react';
import { Book } from './types';
import { BOOKS, CATEGORIES } from './constants';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import BookDetail from './components/BookDetail';
import ChatPage from './components/ChatPage';
import Pagination from './components/Pagination';
import SortFilterControls from './components/SortFilterControls';
import AiContextFinderPage from './components/AiContextFinderModal';

export type Theme = 'light' | 'dark' | 'system';

const BOOKS_PER_PAGE = 15;

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isContextFinderOpen, setIsContextFinderOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookIdParam = params.get('bookId');
    if (bookIdParam) {
      const bookId = parseInt(bookIdParam, 10);
      if (!isNaN(bookId)) {
        const bookFromUrl = BOOKS.find(b => b.id === bookId);
        if (bookFromUrl) {
          setSelectedBook(bookFromUrl);
        }
      }
    }
  }, []);

  const processedBooks = useMemo(() => {
    let books = [...BOOKS];

    if (filterCategory !== 'All') {
      books = books.filter(book => book.category === filterCategory);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      books = books.filter(book =>
        book.title.toLowerCase().includes(lowercasedTerm) ||
        book.description.toLowerCase().includes(lowercasedTerm) ||
        book.category.toLowerCase().includes(lowercasedTerm)
      );
    }

    switch (sortBy) {
      case 'title-asc':
        books.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        books.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year-desc':
        books.sort((a, b) => b.publicationYear - a.publicationYear);
        break;
      case 'year-asc':
        books.sort((a, b) => a.publicationYear - b.publicationYear);
        break;
      case 'default':
      default:
        const tafheemBooks = books.filter(book => book.title.startsWith("Tafheem ul Quran"));
        const otherBooks = books.filter(book => !book.title.startsWith("Tafheem ul Quran"));

        tafheemBooks.sort((a, b) => {
          const volumeA = parseInt(a.title.match(/\(Vol\. (\d+)\)/)?.[1] || '0');
          const volumeB = parseInt(b.title.match(/\(Vol\. (\d+)\)/)?.[1] || '0');
          return volumeA - volumeB;
        });

        otherBooks.sort((a, b) => a.title.localeCompare(b.title));
        books = [...tafheemBooks, ...otherBooks];
        break;
    }
    
    return books;
  }, [searchTerm, filterCategory, sortBy]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy]);

  const totalPages = Math.ceil(processedBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return processedBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [currentPage, processedBooks]);


  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleStartChat = () => {
    if (selectedBook) {
      setIsChatting(true);
    }
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setIsContextFinderOpen(false);
    window.history.pushState({}, '', window.location.pathname);
  };
  
  const handleBackToDetail = () => {
    setIsChatting(false);
  }

  const handleNavigateToBook = (book: Book) => {
    setSelectedBook(book);
    setIsChatting(false);
    setIsContextFinderOpen(false);
  }

  const handleReadPdf = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };
  
  if (isContextFinderOpen) {
    return <AiContextFinderPage 
              onBack={() => setIsContextFinderOpen(false)} 
              onNavigateToBook={handleNavigateToBook}
            />;
  }
  
  if (selectedBook && isChatting) {
    return <ChatPage 
              book={selectedBook} 
              onBack={handleBackToDetail} 
              onNavigateToBook={handleNavigateToBook}
            />;
  }
  
  if (selectedBook) {
    return <BookDetail 
              book={selectedBook} 
              onBack={handleBackToLibrary}
              onReadPdf={() => handleReadPdf(selectedBook.pdfUrl)}
              onStartChat={handleStartChat}
            />;
  }

  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        onOpenContextFinder={() => setIsContextFinderOpen(true)}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-green dark:text-brand-green-dark">Explore the Works of Maududi</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Search for a book or select one below to read the PDF or start an AI-powered conversation about its contents.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto mb-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <div className="max-w-5xl mx-auto">
          <SortFilterControls
            categories={CATEGORIES}
            selectedCategory={filterCategory}
            onSelectCategory={setFilterCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </div>

        {paginatedBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {paginatedBooks.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onClick={handleSelectBook}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">No books found matching your criteria.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
