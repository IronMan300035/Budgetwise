
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const team = [
    {
      name: "Ankit Paul",
      role: "CEO & Founder",
      bio: "Previously led fintech initiatives at major banks. Passionate about democratizing financial tools for everyone.",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQEheLhWTyOqTQ/profile-displayphoto-shrink_800_800/B4EZUu_vouGYAg-/0/1740250218329?e=1750291200&v=beta&t=HQKLHTzq-JLdh1LBMNEbl2-4rLUovqvyVN1DsoI3710",
    },
    {
      name: "Tejas Juneja",
      role: "CEO & Founder",
      bio: "Software engineer with expertise in AI and financial systems. Dedicated to building secure and scalable fintech solutions.",
      image: "https://media.licdn.com/dms/image/v2/D5603AQEkZgMqZZA2iQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1714047406122?e=2147483647&v=beta&t=G-7UQtU00kgxtc5slnmG6gnAoNf9RoQb2Hc0WyTiFvo",
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
