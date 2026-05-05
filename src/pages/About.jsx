export default function About() {
  return (
    <div className="bg-gray-50 flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">About This Project</h1>
          <p className="mt-2 text-gray-600">CSC 805 — Data Visualization, San Francisco State University</p>
        </div>

        {/* Project Description */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            This interactive data visualization explores US traffic accident records from 2022.
            Built with React, D3.js, and Leaflet.js, it provides two complementary views:
            an <strong>Explorer</strong> page with an interactive map for geospatial analysis and
            an <strong>Analytics</strong> dashboard summarizing key trends and patterns across the dataset.
          </p>
          <p className="mt-3 text-gray-700 leading-relaxed">
            The dataset contains approximately 1.76 million accident records from 2022, covering 49 US states.
            Records include location, severity, time, weather conditions, and road features.
            Data was pre-processed into static JSON files for fast, client-side rendering without a backend.
          </p>
        </section>

        {/* Danger Score */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Danger Score Formula</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>danger score</strong> is a weighted metric that quantifies how severe accidents are
            in a given area. It accounts for both the number and severity of accidents:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-lg font-mono text-gray-800">
              Danger Score = (S1 &times; N1 + S2 &times; N2 + S3 &times; N3 + S4 &times; N4) / T
            </p>
          </div>
          <ul className="mt-4 space-y-1 text-gray-600 text-sm">
            <li><strong>S1–S4</strong> — Severity levels (1 = Minor, 2 = Moderate, 3 = Serious, 4 = Fatal)</li>
            <li><strong>N1–N4</strong> — Number of accidents at each severity level</li>
            <li><strong>T</strong> — Total number of accidents in the area</li>
          </ul>
          <p className="mt-3 text-gray-600 text-sm">
            A higher danger score indicates a greater proportion of high-severity accidents.
            The score ranges from 1.0 (all minor) to 4.0 (all fatal).
          </p>
        </section>

        {/* Dataset */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Dataset</h2>
          <p className="text-gray-700 leading-relaxed">
            This project uses the 2022 subset of the{' '}
            <a
              href="https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              US Accidents (2016–2023)
            </a>{' '}
            dataset from Kaggle, originally collected and published by Sobhan Moosavi.
          </p>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <p>
              <strong>Citation:</strong>
            </p>
            <p className="italic">
              Moosavi, Sobhan, Mohammad Hossein Samavatian, Srinivasan Parthasarathy, and Rajiv Ramnath.
              "A Countrywide Traffic Accident Dataset." 2019.
            </p>
            <p className="italic">
              Moosavi, Sobhan, Mohammad Hossein Samavatian, Srinivasan Parthasarathy, Radu Teodorescu, and Rajiv Ramnath.
              "Accident Risk Prediction based on Heterogeneous Sparse Data: New Dataset and Insights."
              In Proceedings of the 27th ACM SIGSPATIAL, 2019.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Team</h2>
          <div className="grid grid-cols-3 gap-4">
            {['Alexander Nikols', 'Zoe Long', 'Andra Bhargav Teja'].map((name) => (
              <div key={name} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-600 font-semibold text-lg">
                  {name.charAt(0)}
                </div>
                <p className="font-medium text-gray-800">{name}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600 text-sm text-center">
            CSC 805 — Data Visualization &middot; San Francisco State University
          </p>
        </section>

      </div>
    </div>
  )
}
