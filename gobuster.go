package gocdp

import "regexp"

var gbRegex *regexp.Regexp = regexp.MustCompile(`Gobuster\s+v[0-9]+\.[0-9]+\.[0-9]+`)

type GobusterParser struct {
}

func (parser GobusterParser) Parse(input string) (CDResults, error) {
	return nil, nil
}

func (parser GobusterParser) CanParse(input string) bool {
	return gbRegex.MatchString(input)
}
