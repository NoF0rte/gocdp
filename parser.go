package gocdp

type Parser interface {
	Parse(input string) (CDResults, error)
	CanParse(input string) bool
}

type Trimmer interface {
	CanTrim(input string) bool
	Trim(input string, max int) (string, error)
}
