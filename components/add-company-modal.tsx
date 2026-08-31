"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCompany: (company: any) => Promise<void> | void;
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
];

const strengthOptions = [
  "1-10",
  "10-50",
  "50-100",
  "100-200",
  "200-500",
  "500 & more",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormData = {
  companyName: string;
  industry: string;
  strength: string;
  image: File | null;
  contactPerson: string;
  designation: string;
  email: string;
  contactNumber: string;
  countryCode: string;
};

type FormErrors = Partial<
  Record<keyof Omit<FormData, "image" | "countryCode">, string>
>;

const initialFormData: FormData = {
  companyName: "",
  industry: "",
  strength: "",
  image: null,
  contactPerson: "",
  designation: "",
  email: "",
  contactNumber: "",
  countryCode: "+92",
};

export function AddCompanyModal({
  open,
  onOpenChange,
  onAddCompany,
}: AddCompanyModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (name: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearFieldError(name as keyof FormErrors);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearFieldError(name as keyof FormErrors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      nextErrors.companyName = "Company name is required.";
    }
    if (!formData.industry) {
      nextErrors.industry = "Please select an industry.";
    }
    if (!formData.strength) {
      nextErrors.strength = "Please select company strength.";
    }
    if (!formData.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required.";
    }
    if (!formData.designation.trim()) {
      nextErrors.designation = "Designation is required.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.contactNumber.trim()) {
      nextErrors.contactNumber = "Contact number is required.";
    } else if (!/^[0-9\s-]{6,}$/.test(formData.contactNumber.trim())) {
      nextErrors.contactNumber = "Enter a valid contact number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      let companyImage = "";
      if (formData.image) {
        companyImage = await fileToBase64(formData.image);
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
      });

      setFormData(initialFormData);
      setErrors({});
      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to add company";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitError("");
    onOpenChange(false);
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
      hasError ? "border-destructive" : "border-input",
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}
    >
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Add New Company
          </DialogTitle>
          <DialogDescription>
            Provide company and contact details to create a new assessment
            profile. Fields marked with{" "}
            <span className='text-destructive'>*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5' noValidate>
          {/* Company Name */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Company Name: <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              name='companyName'
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder=''
              aria-invalid={Boolean(errors.companyName)}
              className={inputClass(Boolean(errors.companyName))}
            />
            {errors.companyName && (
              <p className='text-xs text-destructive mt-1'>
                {errors.companyName}
              </p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Industry: <span className='text-destructive'>*</span>
            </label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleSelectChange("industry", value)}
            >
              <SelectTrigger
                className={cn(
                  "w-full border-input",
                  errors.industry && "border-destructive",
                )}
              >
                <SelectValue placeholder='Select industry' />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className='text-xs text-destructive mt-1'>{errors.industry}</p>
            )}
          </div>

          {/* Strength */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Strength: <span className='text-destructive'>*</span>
            </label>
            <Select
              value={formData.strength}
              onValueChange={(value) => handleSelectChange("strength", value)}
            >
              <SelectTrigger
                className={cn(
                  "w-full border-input",
                  errors.strength && "border-destructive",
                )}
              >
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {strengthOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.strength && (
              <p className='text-xs text-destructive mt-1'>{errors.strength}</p>
            )}
          </div>

          {/* Image Upload (optional) */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Image:
            </label>
            <label className='flex items-center justify-center cursor-pointer'>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
              <div className='flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-secondary transition-colors'>
                <Upload className='h-4 w-4' />
                <span className='text-sm font-medium'>Upload</span>
              </div>
            </label>
            {formData.image && (
              <p className='text-xs text-muted-foreground mt-1'>
                {formData.image.name}
              </p>
            )}
          </div>

          <hr className='my-4 border-border' />

          {/* Contact Person */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Contact Person: <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              name='contactPerson'
              value={formData.contactPerson}
              onChange={handleInputChange}
              placeholder=''
              aria-invalid={Boolean(errors.contactPerson)}
              className={inputClass(Boolean(errors.contactPerson))}
            />
            {errors.contactPerson && (
              <p className='text-xs text-destructive mt-1'>
                {errors.contactPerson}
              </p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Designation: <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              name='designation'
              value={formData.designation}
              onChange={handleInputChange}
              placeholder=''
              aria-invalid={Boolean(errors.designation)}
              className={inputClass(Boolean(errors.designation))}
            />
            {errors.designation && (
              <p className='text-xs text-destructive mt-1'>
                {errors.designation}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Email: <span className='text-destructive'>*</span>
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder=''
              aria-invalid={Boolean(errors.email)}
              className={inputClass(Boolean(errors.email))}
            />
            {errors.email && (
              <p className='text-xs text-destructive mt-1'>{errors.email}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Contact Number: <span className='text-destructive'>*</span>
            </label>
            <div className='flex gap-2'>
              <Select
                value={formData.countryCode}
                onValueChange={(value) =>
                  handleSelectChange("countryCode", value)
                }
              >
                <SelectTrigger className='w-20 border-input'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='+92'>+92</SelectItem>
                  <SelectItem value='+1'>+1</SelectItem>
                  <SelectItem value='+44'>+44</SelectItem>
                  <SelectItem value='+91'>+91</SelectItem>
                  <SelectItem value='+86'>+86</SelectItem>
                </SelectContent>
              </Select>
              <input
                type='tel'
                name='contactNumber'
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder=''
                aria-invalid={Boolean(errors.contactNumber)}
                className={cn(
                  "flex-1",
                  inputClass(Boolean(errors.contactNumber)),
                )}
              />
            </div>
            {errors.contactNumber && (
              <p className='text-xs text-destructive mt-1'>
                {errors.contactNumber}
              </p>
            )}
          </div>

          {submitError && (
            <p className='text-sm text-destructive font-medium'>
              {submitError}
            </p>
          )}

          {/* Buttons */}
          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60'
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className='flex-1 px-6 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors'
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
