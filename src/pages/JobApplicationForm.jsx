import { useState, useRef } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const candidatesUrl = import.meta.env.VITE_CANDIDATES_URL;

function JobApplicationForm() {
  const {id}=useParams();
  const { jobtitle } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
    resume: null,
    cover_letter: null,
    job_id: id,
    job_title: jobtitle,
  });

  const [errors, setErrors] = useState({});
  const [fileMessages, setFileMessages] = useState({});

  const fieldRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    linkedin: useRef(null),
    resume: useRef(null),
    cover_letter: useRef(null),
  };

  const validateLinkedIn = (username) => {
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(username);
  };

  const validateName = (value) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if ((name === 'first_name' || name === 'last_name') && value !== '') {
      if (!validateName(value)) return;
    }
    
    if (name === 'phone') {
      if (!/^\d*$/.test(value)) return;
    }
    
    if (name === 'linkedin') {
      const username = value.replace(/^.*linkedin\.com\/in\//i, '').replace(/\/.*/g, '');
      setFormData({ ...formData, [name]: username });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };
const handleFileChange = (e) => {
  const { name, files } = e.target;
  const file = files[0];

  if (file) {
    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, [name]: "Only PDF files are allowed" }));
      setFormData(prev => ({ ...prev, [name]: null }));
      setFileMessages(prev => ({ ...prev, [name]: "" }));
    } else if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [name]: "File size should be less than 5MB" }));
      setFormData(prev => ({ ...prev, [name]: null }));
      setFileMessages(prev => ({ ...prev, [name]: "" }));
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
      setFormData(prev => ({ ...prev, [name]: file }));
      setFileMessages(prev => ({ ...prev, [name]: "PDF has been uploaded" }));
    }
  } else {
    // If no file is selected, only clear the data and messages
    setFormData(prev => ({ ...prev, [name]: null }));
    setFileMessages(prev => ({ ...prev, [name]: "" }));
    setErrors(prev => ({ ...prev, [name]: "" })); // Clear any existing errors
  }
};



  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form data:', formData); // Add this line
    
    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    } else if (!validateName(formData.first_name)) {
      newErrors.first_name = "First name should only contain letters";
    }
  
    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    } else if (!validateName(formData.last_name)) {
      newErrors.last_name = "Last name should only contain letters";
    }
  
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
  
    if (!formData.linkedin) {
      newErrors.linkedin = "LinkedIn username is required";
    } else if (!validateLinkedIn(formData.linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn username";
    }
  
    if (!formData.resume) newErrors.resume = "Resume is required";
    
    // Only validate cover_letter if a file was selected
    if (formData.cover_letter) {
      if (formData.cover_letter.type !== "application/pdf") {
        newErrors.cover_letter = "Only PDF files are allowed";
      } else if (formData.cover_letter.size > 5 * 1024 * 1024) {
        newErrors.cover_letter = "File size should be less than 5MB";
      }
    }

    setErrors(newErrors);
  
    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      fieldRefs[firstError]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      fieldRefs[firstError]?.current?.focus();
    }
    
    console.log('Validation errors:', newErrors); // Add this line
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      // Check email existence first
      const emailCheck = await axios.get(`${candidatesUrl}/check-email/${formData.email}`);
      if (emailCheck.data.exists) {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
        // Scroll to email field
        fieldRefs.email?.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        fieldRefs.email?.current?.focus();
        return;
      }
  
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
  
      const response = await axios.post(candidatesUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data) {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          linkedin: "",
          website: "",
          resume: null,
          cover_letter: null,
          job_id: id,
          job_title: jobtitle,
        });
        navigate("/success");
      }
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data?.error === "Email already exists") {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
        fieldRefs.email?.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        fieldRefs.email?.current?.focus();
      } else {
        setErrors(prev => ({ 
          ...prev, 
          form: "Failed to submit application. Please try again." 
        }));
      }
    }
  };
  
  return (
    <div className="flex flex-col gap-5 p-4 mx-auto items-center justify-center">
      <NavLink to={`/job/${id}/${jobtitle}`} className="text-red-600 flex items-center">
        <ArrowBackIosIcon /> <p>Back to Job Description</p>
      </NavLink>
      <h2 className="lg:text-3xl text-2xl text-red-600 font-bold">
        {jobtitle}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 w-full max-w-lg"
      >
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Personal Information</h3>

          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="relative mb-6 w-full">
              <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                ref={fieldRefs.first_name}
                onChange={handleChange}
                className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
                />
              {errors.first_name && (
                <p className="text-red-500 text-sm">{errors.first_name}</p>
              )}
            </div>
            <div className="relative mb-6 w-full">
              <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                ref={fieldRefs.last_name}
                onChange={handleChange}
                className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
                />
              {errors.last_name && (
                <p className="text-red-500 text-sm">{errors.last_name}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="relative mb-6 w-full">
              <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
                Email *
              </label>
              <input
                type="email"
                name="email"
                ref={fieldRefs.email}
                value={formData.email}
                onChange={handleChange}
                className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
                
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="relative mb-6 w-full">
              <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                ref={fieldRefs.phone}
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                placeholder="Enter 10 digit number"
                className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
                
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
            Resume/CV *
          </label>
          <input
            type="file"
            name="resume"
            onChange={handleFileChange}
            ref={fieldRefs.resume}
            className="text-gray-500 font-medium w-full text-base file:cursor-pointer cursor-pointer file:text-black file:border-0 file:py-2.5 border file:px-4 file:mr-4 file:bg-gray-200 file:hover:bg-red-500 rounded"
            
          />
          {errors.resume && (
            <p className="text-red-500 text-sm">{errors.resume}</p>
          )}
          {fileMessages.resume && (
            <p className="text-green-500 text-sm">{fileMessages.resume}</p>
          )}
        </div>
        <div className="relative mb-6">
          <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
            Cover Letter (Optional)
          </label>
          <input
            type="file"
            name="cover_letter"
            onChange={handleFileChange}
            className="text-gray-500 font-medium w-full text-base file:cursor-pointer cursor-pointer file:text-black file:border-0 file:py-2.5 file:px-4 file:mr-4 file:bg-gray-200 file:hover:bg-red-500 rounded border"
          />
          {errors.cover_letter && (
            <p className="text-red-500 text-sm">{errors.cover_letter}</p>
          )}
          {fileMessages.cover_letter && (
            <p className="text-green-500 text-sm">{fileMessages.cover_letter}</p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Additional Information</h3>

          <div className="relative mb-6 w-full">
            <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
              LinkedIn Profile *
            </label>
            <input
              type="text"
              name="linkedin"
              placeholder="Enter your LinkedIn username (e.g. johnsmith)"
              value={formData.linkedin}
              ref={fieldRefs.linkedin}
              onChange={handleChange}
              className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
              
            />
            {errors.linkedin && (
              <p className="text-red-500 text-sm">{errors.linkedin}</p>
            )}
          </div>
          <div className="relative mb-6 w-full">
            <label className="flex items-center mb-2 text-gray-600 text-sm font-medium">
              Website
            </label>
            <input
              type="url"
              name="website"
              placeholder="Please mention your website"
              value={formData.website}
              onChange={handleChange}
              className="block w-full h-11 px-5 py-2.5 bg-white shadow-[0_4px_6px_-1px_rgba(254,202,202,0.5),0_2px_4px_-1px_rgba(254,202,202,0.5)] leading-7 text-base font-normal text-gray-900 bg-transparent border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none"
              />
             {/* {errors.website && (
              <p className="text-red-500 text-sm">{errors.website}</p>
            )} */}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="md:w-52 w-full h-12 bg-red-600 hover:bg-red-800 transition-all duration-700 rounded-md drop-shadow-lg text-white text-base font-semibold leading-6 mb-6"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobApplicationForm;