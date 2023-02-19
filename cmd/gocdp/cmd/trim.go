package cmd

import (
	"bufio"
	"os"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

// trimCmd represents the trim command
var trimCmd = &cobra.Command{
	Use:   "trim files...",
	Args:  cobra.MinimumNArgs(1),
	Short: "Trim excess results. Currently only supports trimming ffuf results",
	RunE: func(cmd *cobra.Command, args []string) error {
		max, _ := cmd.Flags().GetInt("max")

		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		return gocdp.SmartTrimFiles(files, max)
	},
}

func init() {
	rootCmd.AddCommand(trimCmd)

	trimCmd.Flags().IntP("max", "m", 1000, "Maximum number of results per status code.")
}
