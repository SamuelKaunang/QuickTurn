import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardM.css'; // Link to the CSS file

const Dashboard = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const projectsRef = useRef(null); // Reference for scrolling
  
  // --- STATE FOR DATA ---
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]); // All fetched projects
  const [loading, setLoading] = useState(true);

  // --- STATE FOR FR-05 (SEARCH & FILTER) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minBudget, setMinBudget] = useState("");

  // --- INITIAL LOAD ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Auth Check
    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!storedToken || role !== "MAHASISWA") {
        navigate("/login");
    } else {
        setUser({ name: "Mahasiswa User", role: role });
        fetchProjects(storedToken);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navigate]);

  // --- FETCH PROJECTS API ---
  const fetchProjects = async (token) => {
      try {
          const response = await fetch("/api/projects", {
              headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
              // Only show OPEN projects
              const openProjects = data.data.filter(p => p.status === 'OPEN');
              setProjects(openProjects);
          }
      } catch (err) {
          console.error("Failed to fetch projects", err);
      } finally {
          setLoading(false);
      }
  };

  // --- FR-05: FILTERING LOGIC ---
  const filteredProjects = projects.filter((project) => {
      // 1. Search by Title (Case insensitive)
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Filter by Category
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;

      // 3. Filter by Budget (Greater than or equal)
      const matchesBudget = minBudget === "" || project.budget >= parseInt(minBudget);

      return matchesSearch && matchesCategory && matchesBudget;
  });

  // Scroll to projects function
  const scrollToProjects = () => {
      projectsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper for Category Colors
  const getCategoryClass = (cat) => {
      if (!cat) return "design";
      if (cat.includes("IT")) return "it";
      if (cat.includes("Marketing")) return "marketing";
      if (cat.includes("Video")) return "marketing"; // Reusing marketing color for now
      return "design";
  };

  return (
    <div className="dashboardM">
      <header className={`headerM ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoM">QuickTurn</div>
        <nav>
          <ul className="nav-menuM">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">My Projects</a></li>
            <li><a href="#">My Applications</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-rightM">
          <i className="fas fa-bell" style={{ color: '#b3b3b3', cursor: 'pointer' }}></i>
          <div className="profile-btnM">
            <i className="fas fa-user"></i>
          </div>
          <div className="logoM" style={{fontSize:'16px', cursor:'pointer'}} onClick={()=>{localStorage.clear(); navigate('/login')}}>
              Logout
          </div>
        </div>
      </header>

      <main className="main-contentM">
        <section className="heroM">
          <div className="hero-overlayM">
            <div className="hero-badgeM">🔥 TRENDING</div>
            <h1>Temukan Project Impianmu</h1>
            <p>Bergabunglah dengan ribuan mahasiswa dan UMKM yang sudah sukses berkolaborasi.</p>
            <div className="hero-btnsM">
              {/* Linked to Scroll Function */}
              <button className="btn-primaryM" onClick={scrollToProjects}>
                <i className="fas fa-compass"></i> Explore Projects
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <div className="stats-gridM">
          <div className="stat-cardM">
            <div className="stat-iconM red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueM">{projects.length}</div>
            <div className="stat-labelM">Available Projects</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueM">0</div>
            <div className="stat-labelM">Completed</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueM">0</div>
            <div className="stat-labelM">My Applications</div>
          </div>
        </div>

        {/* --- FR-05: SEARCH & FILTER BAR --- */}
        <div ref={projectsRef} className="search-filter-container">
            <div className="search-bar-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input 
                    type="text" 
                    placeholder="Cari project (contoh: Website, Logo)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-main"
                />
            </div>
            
            <div className="filter-wrapper">
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    className="filter-select"
                >
                    <option value="All">Semua Kategori</option>
                    <option value="IT / Web">IT / Web</option>
                    <option value="Desain">Desain</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Video">Video</option>
                    <option value="Writing">Writing</option>
                </select>

                <input 
                    type="number" 
                    placeholder="Min Budget (Rp)" 
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="filter-input"
                />
            </div>
        </div>

        {/* --- DYNAMIC PROJECT LIST --- */}
        <div className="section-titleM">
          <span>●</span> Hasil Pencarian ({filteredProjects.length})
        </div>

        <div className="projects-rowM">
          {loading ? (
              <p style={{color:'#888', padding:'20px'}}>Loading projects...</p>
          ) : filteredProjects.length === 0 ? (
              <p style={{color:'#888', padding:'20px'}}>Tidak ada project yang cocok dengan filter anda.</p>
          ) : (
              filteredProjects.map((p) => (
                <div className="project-cardM" key={p.id}>
                    <div className={`card-headerM ${getCategoryClass(p.category)}`}>
                        <i className="fas fa-briefcase"></i>
                        <span className="card-statusM open">● {p.status}</span>
                    </div>
                    <div className="card-bodyM">
                        <div className="card-categoryM">{p.category}</div>
                        <div className="card-titleM">{p.title}</div>
                        <div className="card-metaM">
                            <span className="card-budgetM">Rp {p.budget.toLocaleString()}</span>
                            <span className="card-deadlineM">📅 {p.deadline}</span>
                        </div>
                        <button style={{
                            width: '100%', marginTop: '15px', padding: '8px', 
                            background: '#e50914', border: 'none', borderRadius: '5px', 
                            color: 'white', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            Apply Now
                        </button>
                    </div>
                </div>
              ))
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;