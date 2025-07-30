"use client"

import { useState } from "react"

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    city: "",
    company: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const generateTimestamp = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.mobile || !formData.city) {
      setMessage("Please fill in all fields")
      return
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      setMessage("Please enter a valid 10-digit mobile number")
      return
    }

    setIsSubmitting(true)
    setMessage("")

    try {
      const timestamp = generateTimestamp()

      let serialNumber = "SN-001"
      try {
        const getResponse = await fetch(
          `https://script.google.com/macros/s/AKfycbzab1oL-gk4hgOpVIy43JLQNrazBYDAEYgiEwlWaO_KBwuIURDes2jKXlUffVkVVuh3vQ/exec?sheetName=Form Response`,
          {
            method: "GET",
          },
        )
        const existingData = await getResponse.json()
        if (existingData.success && existingData.values && existingData.values.length > 0) {
          const hasHeader =
            existingData.values.length > 0 &&
            existingData.values[0][0] &&
            existingData.values[0][0].toString().toLowerCase().includes("timestamp")

          const dataRowCount = hasHeader ? existingData.values.length - 1 : existingData.values.length
          const nextSerialNum = (dataRowCount + 1).toString().padStart(3, "0")
          serialNumber = `SN-${nextSerialNum}`
        }
      } catch (error) {
        console.log("Could not fetch existing data, using default serial number:", error)
      }

      const submitData = new URLSearchParams()
      submitData.append("action", "insert")
      submitData.append(
        "rows",
        JSON.stringify([
          {
            sheetName: "Form Response",
            values: [timestamp, serialNumber, formData.name, formData.mobile, formData.city, formData.company],
          },
        ]),
      )

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzab1oL-gk4hgOpVIy43JLQNrazBYDAEYgiEwlWaO_KBwuIURDes2jKXlUffVkVVuh3vQ/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: submitData,
        },
      )

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        setFormData({ name: "", mobile: "", city: "", company: "" })
        setMessage("")
      } else {
        setMessage(`Error: ${result.message || "Failed to submit feedback. Please try again."}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error submitting feedback. Please check your internet connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", mobile: "", city: "", company: "" })
    setMessage("")
  }

  const handleBackToForm = () => {
    setShowSuccess(false)
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {showSuccess ? (
          // Success Page
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
              <div className="w-28 h-28 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                  <img
                    src="/images/at-logo.jpg"
                    alt="A.T. Plus Jewellers Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold">A.T. Plus Jewellers</h1>
              <p className="text-green-100 text-sm mt-1">Symbol of Trust Since 1957</p>
            </div>

            {/* Success Content */}
            <div className="p-8 text-center">
              <div className="text-7xl mb-6 animate-bounce">😊</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your feedback has been submitted successfully. We truly appreciate your time and valuable input.
              </p>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your response has been recorded and our team will review it shortly.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBackToForm}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ← Submit Another Response
              </button>
            </div>
          </div>
        ) : (
          // Main Form
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center text-white">
              <div className="w-28 h-28 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 overflow-hidden border-4 border-white">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                  <img
                    src="/images/at-logo.jpg"
                    alt="A.T. Plus Jewellers Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold">A.T. Plus Jewellers</h1>
              <p className="text-orange-100 text-sm mt-1">Symbol of Trust Since 1957</p>
              <p className="text-orange-200 text-xs mt-1">Specialist in Handmade Bangles</p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Contact</h2>
                <p className="text-gray-600">We'd love to hear from you</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your company name"
                  />
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-xl text-sm font-medium ${
                      message.includes("successfully")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-6 text-center shadow-xl transform hover:scale-105 transition-all duration-300">
          <h3 className="font-bold text-lg mb-3">Contact Information</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">Mumbai:</span> 022-22417567, 49717567
            </p>
            <p>
              <span className="font-semibold">Kolkata:</span> 09330147111 |{" "}
              <span className="font-semibold">Raipur:</span> 9826047111
            </p>
            <p>
              <span className="font-semibold">Email:</span> akshay@atjewels.in
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            Powered By{" "}
            <a
              href="https://www.botivate.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-300 hover:underline"
            >
              Botivate
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default FeedbackForm