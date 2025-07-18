"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Database, Download, Search, Eye, Trash2 } from "lucide-react"
import { useDatabase } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function DatabaseSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const { persons, searchPersons, deletePerson, exportDatabase } = useDatabase()
  const { toast } = useToast()
  const [selectedPerson, setSelectedPerson] = useState<any>(null)

  const filteredPersons = searchQuery ? searchPersons(searchQuery) : persons

  const handleExport = () => {
    exportDatabase()
    toast({
      title: "Database exported",
      description: "The database has been exported as JSON",
    })
  }

  const handleDelete = (id: string, name: string) => {
    deletePerson(id)
    toast({
      title: "Person deleted",
      description: `${name} has been removed from the database`,
    })
  }

  const viewPerson = (person: any) => {
    setSelectedPerson(person)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {filteredPersons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">No entries found in database</div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 bg-muted font-medium text-sm">
              <div>Photo</div>
              <div>Details</div>
              <div>Actions</div>
            </div>

            <div className="divide-y">
              {filteredPersons.map((person) => (
                <div key={person.id} className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <img
                      src={person.image || "/placeholder.svg"}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {person.id}</div>
                    <div className="flex items-center mt-1">
                      <span className={person.status === "criminal" ? "criminal-badge" : "safe-badge"}>
                        {person.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => viewPerson(person)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(person.id, person.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Person Details</DialogTitle>
              <DialogDescription>View complete information about this person</DialogDescription>
            </DialogHeader>

            {selectedPerson && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                    <img
                      src={selectedPerson.image || "/placeholder.svg"}
                      alt={selectedPerson.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="font-semibold">Name</div>
                  <div className="bg-muted p-2 rounded-md">{selectedPerson.name}</div>

                  <div className="font-semibold">ID</div>
                  <div className="bg-muted p-2 rounded-md">{selectedPerson.id}</div>

                  <div className="font-semibold">Status</div>
                  <div className="bg-muted p-2 rounded-md flex items-center">
                    <span className={selectedPerson.status === "criminal" ? "criminal-badge" : "safe-badge"}>
                      {selectedPerson.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="font-semibold">Added on</div>
                  <div className="bg-muted p-2 rounded-md">{new Date(selectedPerson.timestamp).toLocaleString()}</div>

                  {selectedPerson.notes && (
                    <>
                      <div className="font-semibold">Notes</div>
                      <div className="bg-muted p-2 rounded-md whitespace-pre-wrap">{selectedPerson.notes}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

