
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const team = [
    {
      name: "Ankit Paul",
      role: "CEO & Founder",
      bio: "Currently, I'm a Bachelor of Computer Application student specializing in AI and Data Science. As a budding Computer Application bachelor's student, I've plunged into AI with the guidance of Samatrix and IBM, pushing boundaries both academically and practically.",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQEheLhWTyOqTQ/profile-displayphoto-shrink_800_800/B4EZUu_vouGYAg-/0/1740250218329?e=1750291200&v=beta&t=HQKLHTzq-JLdh1LBMNEbl2-4rLUovqvyVN1DsoI3710",
    },
    {
      name: "Tejas Juneja",
      role: "CEO & Founder",
      bio: "BCA Student Specializing in AI ,Data Science & Machine Learning | Bridging the Gap between Data Science and Practical Applications",
      image: "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",
    },
    {
      name: "Dr. Pankaj Aggarwal",
      role: "Mentor",
      bio: "Dr. Pankaj Agarwal is Professor & Dean (Engineering) at K.R. Mangalam University with over 21 years of teaching and 15+ years of research experience. He holds a Ph.D. in Computer Science and has published 45+ papers, 7 patents, and supervised 5 Ph.D. scholars. His expertise includes Data Science, ML, NLP, and Deep Learning.",
      image: "https://cdn-ilakggn.nitrocdn.com/qfLlPHxtFDGRhIOUKhiZcDNvbHvEtWcT/assets/images/optimized/rev-b491dba/www.krmangalam.edu.in/wp-content/uploads/2023/12/Mask-group-37.webp",
    },
    {
      name: "Ms. Kriti Sharma",
      role: "Head of Product",
      bio: "Assistant Professor - Computer Science and Engineering . User experience specialist focused on creating intuitive financial tools that anyone can use.",
      image: "https://media.licdn.com/dms/image/v2/C5603AQHBGNe9iXX15w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1584196822273?e=1750291200&v=beta&t=zkH52YAhk9J_wd-YzJE4QG7SBdjhV8lpq2K7-qcpbNA",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">About BudgetWise</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg mb-6">
                At BudgetWise, we're on a mission to simplify personal finance and empower everyone to achieve financial wellness. We believe that financial tools should be accessible, understandable, and actionable for everyone, regardless of their financial background.
              </p>
              <p className="text-lg mb-6">
                We combine cutting-edge technology with practical financial wisdom to create a platform that not only helps you track your money but truly understand it.
              </p>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-lg">
                BudgetWise began in 2025 when our founders, frustrated with the complexity of existing financial tools, set out to build something better. What started as a simple budgeting app has grown into a comprehensive platform that helps thousands of users track, plan, and grow their finances.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -z-10 top-0 right-0 h-72 w-72 bg-primary/20 rounded-full blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                className="rounded-xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {team.map((member, i) => (
              <Card key={i} className="overflow-hidden hover-scale">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-1">{member.name}</h3>
                  <p className="text-primary mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted/50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Simplicity</h3>
                <p>We believe financial tools should be easy to understand and use, eliminating complexity to focus on what matters.</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Security</h3>
                <p>Your financial data is sensitive. We employ the highest security standards to ensure your information is always protected.</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p>We're committed to being open about how we work, how we use your data, and how we make money.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
