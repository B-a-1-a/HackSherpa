"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import Navigation from "@/components/navigation"

interface Project {
  id: string
  title: string
  description: string
  category: string
  url: string
  image_url: string
  winner?: boolean
}

async function fetchProjectsByCategory(category: string): Promise<Project[]> {
  try {
    const response = await fetch("/api/broseCategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [],
        data: {
          projectDetails: {
            title: category,
            description: "",
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch project recommendations")
    }

    const data = await response.json()
    console.log("Fetched Projects:", data)

    return data.map((doc: any) => ({
      id: doc.id.toString(),
      title: doc.title,
      description: doc.summary,
      category: `${doc.primary_category} / ${doc.secondary_category}`,
      url: doc.url,
      image_url: doc.image_url,
      winner: doc.winner,
    }))
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  // Memoize the decoded category so that it doesn't change on every render.
  const category = useMemo(() => {
    return params.category ? decodeURIComponent(params.category as string) : ""
  }, [params.category])

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    async function getProjects() {
      if (category) {
        setIsLoading(true)
        setShowResults(false)
        const fetchedProjects = await fetchProjectsByCategory(category)
        setProjects(fetchedProjects)
        setIsLoading(false)
        setShowResults(true)
      }
    }
    getProjects()
  }, [category])

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen bg-background dark:bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <main className="relative container mx-auto px-4 pt-32 pb-12">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" className="mb-8 hover:bg-primary/10" onClick={() => router.push("/browse")}>
              Back to Categories
            </Button>
            <h1 className="text-4xl font-bold mb-8 gradient-text text-center">{category}</h1>
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-xl font-semibold text-center text-foreground">Projects in {category}</h2>

                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{
                            scale: 1.03,
                            transition: { duration: 0.2 },
                          }}
                          className="flex"
                        >
                          <div className={`relative w-full ${project.winner ? "p-[3px] rounded-lg" : ""}`}>
                            {project.winner && (
                              <>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 animate-pulse-slow" />
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-semibold px-3 py-1 rounded-tr-lg rounded-bl-lg z-10">
                                  Winner
                                </div>
                              </>
                            )}
                            <Card
                              className={`bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors duration-300 h-full ${project.winner ? "relative z-[1] bg-background" : ""}`}
                            >
                              <CardHeader>
                                <CardTitle className="text-foreground">{project.title}</CardTitle>
                                <CardDescription>{project.category}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <img
                                  src={project.image_url || "/placeholder.svg?height=200&width=400"}
                                  alt={project.title}
                                  className="w-full h-32 object-cover rounded-lg mb-4"
                                />
                                <p className="text-muted-foreground">{project.description}</p>
                              </CardContent>
                              <CardFooter>
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  View Project
                                </a>
                              </CardFooter>
                            </Card>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No projects found. Try adjusting your search.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {isLoading && <div className="text-center text-muted-foreground py-12">Loading projects...</div>}
          </div>
        </main>
      </div>
    </>
  )
}

