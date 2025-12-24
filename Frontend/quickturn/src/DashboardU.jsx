import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardU.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]); // <--- Store Real Projects Here
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
      title: "",
      description: "",
      category: "IT / Web",
      budget: "",
      deadline: ""
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!storedToken || role !== "UMKM") {
        navigate("/login");
    } else {
        setToken(storedToken);
        setUser({ name: "UMKM User", role: role });
        // FETCH PROJECTS IMMEDIATELY
        fetchProjects(storedToken); 
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  // --- FUNCTION TO FETCH PROJECTS ---
  const fetchProjects = async (authToken) => {
      try {
          const response = await fetch("/api/projects/my-projects", {
              headers: { "Authorization": `Bearer ${authToken}` }
          });
          const data = await response.json();
          if (response.ok) {
              setProjects(data.data || []); // Save data to state
          }
      } catch (err) {
          console.error("Failed to load projects", err);
      }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostProject = async (e) => {
      e.preventDefault();
      setError("");
      setSuccessMsg("");

      try {
          const response = await fetch("/api/projects", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(formData)
          });

          const data = await response.json();

          if (!response.ok) throw new Error(data.message || "Gagal memposting project");

          setSuccessMsg("Project Berhasil Dibuat! 🚀");
          
          // REFRESH LIST & CLOSE MODAL
          fetchProjects(token); 
          setTimeout(() => {
              setShowModal(false);
              setSuccessMsg("");
              setFormData({ title: "", description: "", category: "IT / Web", budget: "", deadline: "" });
          }, 1000);

      } catch (err) {
          setError(err.message);
      }
  };

  // Helper to color-code categories
  const getCategoryClass = (cat) => {
      if (!cat) return "design"; 
      if (cat.includes("IT")) return "it";
      if (cat.includes("Marketing")) return "marketing";
      return "design";
  };

  return (
    <div className="dashboardU">
      <header className={`headerU ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoU">QuickTurn</div>
        <nav>
          <ul className="nav-menuU">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#"> My Projects</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-rightU">
          <i className="fas fa-bell" style={{ color: '#b3b3b3', cursor: 'pointer' }}></i>
          <div className="profile-btnU"><i className="fas fa-user"></i></div>
        </div>
      </header>

      <main className="main-contentU">
        <section className="heroU">
          <div className="hero-overlayU ">
            <h1>Percepat proses perekrutan Anda</h1>
            <p>Posting lowongan pekerjaan dan temukan kandidat terbaik.</p>
            <div className="hero-btnsU">
              <button onClick={() => setShowModal(true)} className="btn-primaryU">
                <i className="fas fa-plus"></i> Post Project
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-gridU">
          <div className="stat-cardU">
            <div className="stat-iconU red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueU">{projects.length}</div>
            <div className="stat-labelU">Total Projects</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueU">0</div> 
            <div className="stat-labelU">Completed</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueU">0</div> 
            <div className="stat-labelU">Applicants</div>
          </div>
        </div>

        {/* Dynamic Project List */}
        <div className="section-titleU">
          <span>●</span> Project Terbaru
          <div className="see-allU">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        
        <div className="projects-rowU">
          {projects.length === 0 ? (
              <p style={{color: '#888', padding: '20px'}}>Belum ada project. Silakan buat project baru!</p>
          ) : (
              projects.map((p) => (
                <div className="project-cardU" key={p.id}>
                    <div className={`card-headerU ${getCategoryClass(p.category)}`}>
                        <i className="fas fa-briefcase"></i>
                        <span className="card-statusU open">● {p.status}</span>
                    </div>
                    <div className="card-bodyU">
                        <div className="card-categoryU">{p.category}</div>
                        <div className="card-titleU">{p.title}</div>
                        <div className="card-metaU">
                            <span className="card-budgetU">Rp {p.budget.toLocaleString()}</span>
                            <span className="card-deadlineU">📅 {p.deadline}</span>
                        </div>
                    </div>
                </div>
              ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlayU">
            <div className="modal-contentU">
                <div className="modal-headerU">
                    <h3>Buat Project Baru</h3>
                    <button onClick={() => setShowModal(false)} className="close-btnU">✖</button>
                </div>
                {error && <p className="msg-error">{error}</p>}
                {successMsg && <p className="msg-success">{successMsg}</p>}
                <form onSubmit={handlePostProject} className="modal-formU">
                    <div className="form-groupU">
                        <label>Judul Project</label>
                        <input name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-groupU">
                        <label>Deskripsi</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required />
                    </div>
                    <div className="form-rowU">
                        <div className="form-groupU">
                            <label>Kategori</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="IT / Web">IT / Web</option>
                                <option value="Desain">Desain</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Video">Video</option>
                                <option value="Writing">Writing</option>
                            </select>
                        </div>
                        <div className="form-groupU">
                            <label>Budget (Rp)</label>
                            <input type="number" name="budget" value={formData.budget} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-groupU">
                        <label>Deadline</label>
                        <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
                    </div>
                    <div className="modal-actionsU">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-cancelU">Batal</button>
                        <button type="submit" className="btn-submitU">Posting Project</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;