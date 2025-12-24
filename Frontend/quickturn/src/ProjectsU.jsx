import React from 'react';
import './ProjectsU.css'; // We will move card CSS here later

const ProjectsU = ({ projects }) => {
    // Helper to color-code categories
    const getCategoryClass = (cat) => {
        if (!cat) return "design"; 
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        return "design";
    };

    return (
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
    );
};

export default ProjectsU;