"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddCompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCompany: (company: any) => Promise<void> | void
}

const industryOptions = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Energy",
  "Telecommunications",
  "Education",
  "Transportation",
  "Other",
]

const strengthOptions = [
  "Initial",
  "Developing",
  "Established",
  "Transformative",
]

export function AddCompanyModal({
  open,
  onOpenChange,
  onAddCompany,
}: AddCompanyModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    strength: "",
    image: null as File | null,
    contactPerson: "",
    designation: "",
    email: "",
    contactNumber: "",
    countryCode: "+92",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.companyName ||
      !formData.industry ||
      !formData.contactPerson
    ) {
      alert("Please fill in all required fields")
      return
    }

    try {
      let companyImage = ""
      if (formData.image) {
        companyImage = await fileToBase64(formData.image)
      }

      await onAddCompany({
        companyName: formData.companyName,
        industry: formData.industry,
        strength: formData.strength,
        companyImage,
        personName: formData.contactPerson,
        designation: formData.designation,
        email: formData.email,
        contactNumber: `${formData.countryCode} ${formData.contactNumber}`,
      })

      setFormData({
        companyName: "",
        industry: "",
        strength: "",
        image: null,
        contactPerson: "",
        designation: "",
        email: "",
        contactNumber: "",
        countryCode: "+92",
      })

      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to add company"
      alert(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Company
          </DialogTitle>
          <DialogDescription>
            Provide company and contact details to create a new assessment profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Company Name:
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder=""
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Industry:
            </label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleSelectChange("industry", value)}
            >
              <SelectTrigger className="w-full border-input">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strength */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Strength:
            </label>
            <Select
              value={formData.strength}
              onValueChange={(value) => handleSelectChange("strength", value)}
            >
              <SelectTrigger className="w-full border-input">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {strengthOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Image:
            </label>
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-secondary transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload</span>
              </div>
            </label>
            {formData.image && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.image.name}
              </p>
            )}
          </div>

          <hr className="my-4 border-border" />

          {/* Contact Person */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Contact Person:
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              placeholder=""
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Designation:
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder=""
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder=""
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Contact Number:
            </label>
            <div className="flex gap-2">
              <Select
                value={formData.countryCode}
                onValueChange={(value) =>
                  handleSelectChange("countryCode", value)
                }
              >
                <SelectTrigger className="w-20 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+92">+92</SelectItem>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+86">+86</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder=""
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-6 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
