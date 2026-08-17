package seed

// Edit this file freely to add/remove seed operators and machines —
// nothing else needs to change when you do.

type SeedOperator struct {
	FullName string
	Email    string
}

var Operators = []SeedOperator{
	{FullName: "Ravi Kumar", Email: "ravi.kumar@seed.local"},
	{FullName: "Priya Nair", Email: "priya.nair@seed.local"},
	{FullName: "Arjun Mehta", Email: "arjun.mehta@seed.local"},
	{FullName: "Sneha Rao", Email: "sneha.rao@seed.local"},
	{FullName: "Vikram Singh", Email: "vikram.singh@seed.local"},
	{FullName: "Anjali Desai", Email: "anjali.desai@seed.local"},
	{FullName: "Karan Malhotra", Email: "karan.malhotra@seed.local"},
	{FullName: "Divya Iyer", Email: "divya.iyer@seed.local"},
	{FullName: "Rohan Gupta", Email: "rohan.gupta@seed.local"},
	{FullName: "Meera Pillai", Email: "meera.pillai@seed.local"},
}

// SeedOperatorPassword is the plaintext password every seeded operator
// gets — hashed properly at insert time, never stored plaintext.
const SeedOperatorPassword = "123456"

type SeedTestSite struct {
	TestSiteNumber        string
	Division              string
	CurveType             string
	CurveNumber           string
	DegreeOfCurve         string
	Section                string
	Station               string
	Line                  string
	KmFrom                float64
	KmTo                  float64
	GmtYear               float64
	NextGrindingDueDate   string // "YYYY-MM-DD", "" = not set
	NextRepaintingDueDate string
}

type SeedMachine struct {
	Name        string
	MachineType string // must match services.MachineTypePoints keys
	TestSites   []SeedTestSite
}

// Due dates are deliberately spread across overdue / due-soon / not-due
// so the Test Site Tracker page has something real to show for every
// status color the moment this seed runs.
var Machines = []SeedMachine{
	{
		Name:        "RGI96-1",
		MachineType: "RGI96",
		TestSites: []SeedTestSite{
			{TestSiteNumber: "T73", Division: "UMB/NR", CurveType: "Circular", CurveNumber: "12", DegreeOfCurve: "2.5", Section: "KKDE-UMB", Station: "UMB", Line: "UP", KmFrom: 191.507, KmTo: 191.827, GmtYear: 37.65, NextGrindingDueDate: "2026-08-01", NextRepaintingDueDate: "2026-10-04"},
			{TestSiteNumber: "T74", Division: "UMB/NR", CurveType: "Circular", CurveNumber: "13", DegreeOfCurve: "2.1", Section: "KKDE-UMB", Station: "UMB", Line: "DN", KmFrom: 191.598, KmTo: 191.868, GmtYear: 45.66, NextGrindingDueDate: "2026-07-10", NextRepaintingDueDate: "2026-10-04"},
			{TestSiteNumber: "T75", Division: "DLI/NR", CurveType: "Transition", CurveNumber: "8", DegreeOfCurve: "3.0", Section: "DLI-PNP", Station: "SLKN", Line: "UP", KmFrom: 49.5, KmTo: 50.5, GmtYear: 63.04, NextGrindingDueDate: "2026-09-15", NextRepaintingDueDate: "2026-08-02"},
			{TestSiteNumber: "T76", Division: "DLI/NR", CurveType: "Transition", CurveNumber: "9", DegreeOfCurve: "2.8", Section: "DLI-PNP", Station: "SLKN", Line: "DN", KmFrom: 49.5, KmTo: 50.5, GmtYear: 65.01, NextGrindingDueDate: "2026-08-05", NextRepaintingDueDate: "2026-08-02"},
			{TestSiteNumber: "T77", Division: "UMB/NR", CurveType: "Circular", CurveNumber: "14", DegreeOfCurve: "1.9", Section: "KKDE-UMB", Station: "UMB", Line: "UP", KmFrom: 192.1, KmTo: 192.4, GmtYear: 40.2, NextGrindingDueDate: "2026-11-20", NextRepaintingDueDate: "2026-12-01"},
			{TestSiteNumber: "T78", Division: "UMB/NR", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "KKDE-UMB", Station: "UMB", Line: "DN", KmFrom: 192.5, KmTo: 192.9, GmtYear: 38.9, NextGrindingDueDate: "2026-07-05", NextRepaintingDueDate: "2026-09-10"},
		},
	},
	{
		Name:        "SRGM-1",
		MachineType: "SRGM",
		TestSites: []SeedTestSite{
			{TestSiteNumber: "T50", Division: "HYB/SCR", CurveType: "Circular", CurveNumber: "21", DegreeOfCurve: "2.2", Section: "HYB-SC", Station: "SC", Line: "SL", KmFrom: 12.3, KmTo: 13.1, GmtYear: 22.4, NextGrindingDueDate: "2026-12-01", NextRepaintingDueDate: "2027-01-15"},
			{TestSiteNumber: "T51", Division: "HYB/SCR", CurveType: "Transition", CurveNumber: "22", DegreeOfCurve: "1.7", Section: "HYB-SC", Station: "SC", Line: "ML", KmFrom: 13.2, KmTo: 14.0, GmtYear: 25.8, NextGrindingDueDate: "2026-07-08", NextRepaintingDueDate: "2026-08-20"},
			{TestSiteNumber: "T52", Division: "HYB/SCR", CurveType: "Circular", CurveNumber: "23", DegreeOfCurve: "2.9", Section: "HYB-SC", Station: "SC", Line: "BL", KmFrom: 14.1, KmTo: 14.9, GmtYear: 30.5, NextGrindingDueDate: "2026-08-25", NextRepaintingDueDate: "2026-11-01"},
			{TestSiteNumber: "T53", Division: "HYB/SCR", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "HYB-SC", Station: "SC", Line: "UP", KmFrom: 15.0, KmTo: 15.8, GmtYear: 18.9, NextGrindingDueDate: "2026-09-30", NextRepaintingDueDate: "2026-10-15"},
			{TestSiteNumber: "T54", Division: "HYB/SCR", CurveType: "Circular", CurveNumber: "24", DegreeOfCurve: "3.1", Section: "HYB-SC", Station: "SC", Line: "DN", KmFrom: 15.9, KmTo: 16.7, GmtYear: 27.3, NextGrindingDueDate: "2026-07-15", NextRepaintingDueDate: "2026-09-01"},
			{TestSiteNumber: "T55", Division: "HYB/SCR", CurveType: "Transition", CurveNumber: "25", DegreeOfCurve: "2.4", Section: "HYB-SC", Station: "SC", Line: "SL", KmFrom: 16.8, KmTo: 17.5, GmtYear: 33.1, NextGrindingDueDate: "2026-10-10", NextRepaintingDueDate: "2026-12-20"},
			{TestSiteNumber: "T56", Division: "HYB/SCR", CurveType: "Circular", CurveNumber: "26", DegreeOfCurve: "2.0", Section: "HYB-SC", Station: "SC", Line: "ML", KmFrom: 17.6, KmTo: 18.4, GmtYear: 29.7, NextGrindingDueDate: "2026-07-12", NextRepaintingDueDate: "2026-08-30"},
		},
	},
	{
		Name:        "LRG-1",
		MachineType: "LRG",
		TestSites: []SeedTestSite{
			{TestSiteNumber: "T20", Division: "PUNE/CR", CurveType: "Circular", CurveNumber: "5", DegreeOfCurve: "1.8", Section: "PUNE-LNL", Station: "LNL", Line: "ML", KmFrom: 4.5, KmTo: 5.0, GmtYear: 30.1, NextGrindingDueDate: "2026-07-25", NextRepaintingDueDate: "2026-09-22"},
			{TestSiteNumber: "T21", Division: "PUNE/CR", CurveType: "Transition", CurveNumber: "6", DegreeOfCurve: "2.6", Section: "PUNE-LNL", Station: "LNL", Line: "BL", KmFrom: 5.1, KmTo: 5.7, GmtYear: 28.4, NextGrindingDueDate: "2026-08-18", NextRepaintingDueDate: "2026-10-05"},
			{TestSiteNumber: "T22", Division: "PUNE/CR", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "PUNE-LNL", Station: "LNL", Line: "UP", KmFrom: 5.8, KmTo: 6.4, GmtYear: 24.9, NextGrindingDueDate: "2026-09-01", NextRepaintingDueDate: "2026-11-11"},
			{TestSiteNumber: "T23", Division: "PUNE/CR", CurveType: "Circular", CurveNumber: "7", DegreeOfCurve: "2.2", Section: "PUNE-LNL", Station: "LNL", Line: "DN", KmFrom: 6.5, KmTo: 7.1, GmtYear: 26.7, NextGrindingDueDate: "2026-07-06", NextRepaintingDueDate: "2026-08-14"},
			{TestSiteNumber: "T24", Division: "PUNE/CR", CurveType: "Circular", CurveNumber: "8", DegreeOfCurve: "1.5", Section: "PUNE-LNL", Station: "LNL", Line: "SL", KmFrom: 7.2, KmTo: 7.9, GmtYear: 21.3, NextGrindingDueDate: "2026-12-05", NextRepaintingDueDate: "2027-01-20"},
			{TestSiteNumber: "T25", Division: "PUNE/CR", CurveType: "Transition", CurveNumber: "9", DegreeOfCurve: "2.9", Section: "PUNE-LNL", Station: "LNL", Line: "ML", KmFrom: 8.0, KmTo: 8.6, GmtYear: 32.0, NextGrindingDueDate: "2026-07-09", NextRepaintingDueDate: "2026-08-28"},
		},
	},
	{
		Name:        "FM-SWR",
		MachineType: "FM",
		TestSites: []SeedTestSite{
			{TestSiteNumber: "T10", Division: "CBE/SWR", CurveType: "Circular", CurveNumber: "1", DegreeOfCurve: "1.9", Section: "CBE-ED", Station: "ED", Line: "BL", KmFrom: 8.0, KmTo: 8.5, GmtYear: 15.6, NextGrindingDueDate: "2027-05-01", NextRepaintingDueDate: "2026-11-01"},
			{TestSiteNumber: "T11", Division: "CBE/SWR", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "CBE-ED", Station: "ED", Line: "UP", KmFrom: 8.6, KmTo: 9.2, GmtYear: 17.8, NextGrindingDueDate: "2026-07-14", NextRepaintingDueDate: "2026-09-05"},
			{TestSiteNumber: "T12", Division: "CBE/SWR", CurveType: "Transition", CurveNumber: "2", DegreeOfCurve: "2.3", Section: "CBE-ED", Station: "ED", Line: "DN", KmFrom: 9.3, KmTo: 9.9, GmtYear: 19.2, NextGrindingDueDate: "2026-08-22", NextRepaintingDueDate: "2026-10-30"},
			{TestSiteNumber: "T13", Division: "CBE/SWR", CurveType: "Circular", CurveNumber: "3", DegreeOfCurve: "2.7", Section: "CBE-ED", Station: "ED", Line: "SL", KmFrom: 10.0, KmTo: 10.6, GmtYear: 20.5, NextGrindingDueDate: "2026-07-03", NextRepaintingDueDate: "2026-08-11"},
			{TestSiteNumber: "T14", Division: "CBE/SWR", CurveType: "Circular", CurveNumber: "4", DegreeOfCurve: "1.6", Section: "CBE-ED", Station: "ED", Line: "ML", KmFrom: 10.7, KmTo: 11.3, GmtYear: 23.1, NextGrindingDueDate: "2026-09-18", NextRepaintingDueDate: "2026-11-25"},
			{TestSiteNumber: "T15", Division: "CBE/SWR", CurveType: "Transition", CurveNumber: "5", DegreeOfCurve: "3.0", Section: "CBE-ED", Station: "ED", Line: "BL", KmFrom: 11.4, KmTo: 12.0, GmtYear: 25.0, NextGrindingDueDate: "2026-10-27", NextRepaintingDueDate: "2026-12-15"},
			{TestSiteNumber: "T16", Division: "CBE/SWR", CurveType: "Circular", CurveNumber: "6", DegreeOfCurve: "2.1", Section: "CBE-ED", Station: "ED", Line: "UP", KmFrom: 12.1, KmTo: 12.7, GmtYear: 27.9, NextGrindingDueDate: "2026-07-17", NextRepaintingDueDate: "2026-09-08"},
			{TestSiteNumber: "T17", Division: "CBE/SWR", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "CBE-ED", Station: "ED", Line: "DN", KmFrom: 12.8, KmTo: 13.4, GmtYear: 16.4, NextGrindingDueDate: "2026-08-09", NextRepaintingDueDate: "2026-10-18"},
		},
	},
	{
		Name:        "CMRL-VRA-1",
		MachineType: "CMRL_VRA",
		TestSites: []SeedTestSite{
			{TestSiteNumber: "T90", Division: "CMRL/VRA", CurveType: "Circular", CurveNumber: "31", DegreeOfCurve: "2.4", Section: "VRA-CTL", Station: "CTL", Line: "UP", KmFrom: 2.1, KmTo: 2.7, GmtYear: 12.8, NextGrindingDueDate: "2026-07-22", NextRepaintingDueDate: "2026-09-14"},
			{TestSiteNumber: "T91", Division: "CMRL/VRA", CurveType: "Transition", CurveNumber: "32", DegreeOfCurve: "1.9", Section: "VRA-CTL", Station: "CTL", Line: "DN", KmFrom: 2.8, KmTo: 3.4, GmtYear: 14.6, NextGrindingDueDate: "2026-08-30", NextRepaintingDueDate: "2026-10-20"},
			{TestSiteNumber: "T92", Division: "CMRL/VRA", CurveType: "Circular", CurveNumber: "33", DegreeOfCurve: "2.8", Section: "VRA-CTL", Station: "CTL", Line: "ML", KmFrom: 3.5, KmTo: 4.1, GmtYear: 16.1, NextGrindingDueDate: "2026-07-04", NextRepaintingDueDate: "2026-08-25"},
			{TestSiteNumber: "T93", Division: "CMRL/VRA", CurveType: "Straight", CurveNumber: "", DegreeOfCurve: "", Section: "VRA-CTL", Station: "CTL", Line: "SL", KmFrom: 4.2, KmTo: 4.8, GmtYear: 11.3, NextGrindingDueDate: "2026-11-08", NextRepaintingDueDate: "2027-01-05"},
			{TestSiteNumber: "T94", Division: "CMRL/VRA", CurveType: "Circular", CurveNumber: "34", DegreeOfCurve: "2.0", Section: "VRA-CTL", Station: "CTL", Line: "BL", KmFrom: 4.9, KmTo: 5.5, GmtYear: 13.7, NextGrindingDueDate: "2026-08-13", NextRepaintingDueDate: "2026-10-02"},
			{TestSiteNumber: "T95", Division: "CMRL/VRA", CurveType: "Transition", CurveNumber: "35", DegreeOfCurve: "2.5", Section: "VRA-CTL", Station: "CTL", Line: "UP", KmFrom: 5.6, KmTo: 6.2, GmtYear: 15.0, NextGrindingDueDate: "2026-07-19", NextRepaintingDueDate: "2026-09-27"},
		},
	},
}